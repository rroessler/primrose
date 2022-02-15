/**************
 *  TYPEDEFS  *
 **************/

/// Tween Easing Method Alias.
type EasingMethod = (time: number) => number;

/// Tween Constructor Options.
interface IPrimrose<T> {
    from: T; // FROM values.
    to: T; // TO values.
    duration?: number; // Tween duration.
    easer?: EasingMethod; // Easing method.
    onUpdate?: (val: T) => void; // Updater method.
    onComplete?: () => void; // Completion method.
}

/*************
 *  EASINGS  *
 *************/

/// Easing Power Implementation.
const easingPower = (pow: number) => ({
    IN: (t: number) => Math.pow(t, pow),
    OUT: (t: number) => 1 - Math.abs(Math.pow(t - 1, pow)),
    IN_OUT: (t: number) => (t < 0.5 ? Math.pow(t * 2, pow) / 2 : (1 - Math.abs(Math.pow(t * 2 - 2, pow))) / 2)
});

/// Available Easing Functions.
const EASING = {
    LINEAR: (t: number) => t,

    QUAD: easingPower(2),
    CUBIC: easingPower(3),
    QUART: easingPower(4),
    QUINT: easingPower(5),

    SINE: {
        IN: (t: number) => 1 - Math.cos((t * Math.PI) / 2),
        OUT: (t: number) => Math.sin((t * Math.PI) / 2),
        IN_OUT: (t: number) => -(Math.cos(Math.PI * t) - 1) / 1
    },

    EXPO: {
        IN: (t: number) => (t === 0 ? 0 : Math.pow(2, 10 * t - 10)),
        OUT: (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
        BOTH: (t: number) =>
            t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2
    },

    CIRC: {
        IN: (t: number) => 1 - Math.sqrt(1 - Math.pow(t, 2)),
        OUT: (t: number) => Math.sqrt(1 - Math.pow(t - 1, 2)),
        BOTH: (t: number) =>
            t < 0.5 ? (1 - Math.sqrt(1 - Math.pow(2 * t, 2))) / 2 : (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2
    }
};

/*************
 *  HELPERS  *
 *************/

/// Scheduler roots.
const __root__ = typeof window !== 'undefined' ? window : global;

/// Possible Schedulers.
const __schedulers__ = [
    'requestAnimationFrame',
    'webkitRequestAnimationFrame',
    'oRequestAnimationFrame',
    'msRequestAnimationFrame'
];

/// Collapse to the most suitable scheduler available.
const scheduler: any =
    __schedulers__.map((animator) => (<any>__root__)[animator]).filter((s) => s)[0] ??
    ((<any>__root__).mozCancelRequestAnimationFrame && (<any>__root__).mozRequestAnimationFrame) ??
    setTimeout;

/********************
 *  IMPLEMENTATION  *
 ********************/

/// Core Primrose Implementation.
class Primrose<T> implements IPrimrose<T> {
    /****************
     *  PROPERTIES  *
     ****************/

    from: T; // FROM values.
    to: T; // TO values.
    duration = 2000; // Tween duration.
    easer = EASING.LINEAR; // Root easing function.

    private m_startTime: number; // Starting time.
    private m_elapsed = 0; // Elapsed Time.
    private m_scaledTime = 0; // Scaled Time (0 -> 1).
    private m_current: T; // Current Values.
    private m_running = false; // Denotes if currently running.

    static readonly easing = EASING; /// Primrose Easing Functions.
    static readonly INTERVAL = 1000 / 60; /// Millisecond intervals.

    /******************
     *  CONSTRUCTORS  *
     ******************/

    /**
     * Private Constructor to force use of STATIC methods.
     * @param opts                  Primrose Options.
     */
    private constructor(opts: IPrimrose<T>) {
        Object.assign(this, opts); // assign the base options.
        this.m_validate(); // validate the given options.

        // make a copy using JSON cloning (can't tween complex items anyway)
        this.m_current = JSON.parse(JSON.stringify(this.from));
    }

    /**
     * Creates a Primrose tweening instance.
     * @param opts                  Primrose Options.
     */
    static create<T>(opts: IPrimrose<T>) {
        return new Primrose<T>(opts);
    }

    /**
     * Creates an auto-playing Primrose tweening instance.
     * @param opts                  Primrose Options.
     */
    static auto<T>(opts: IPrimrose<T>) {
        return Primrose.create<T>(opts).start();
    }

    /// Promisified Constructor Methods. These instances only resolve on completion and as
    /// such have had their `onComplete` methods removed.
    static promises = {
        /// Creates a promisified Primrose instance.
        create: <T>(opts: Omit<IPrimrose<T>, 'onComplete'>) => ({
            start: () => Primrose.promises.auto(opts)
        }),

        /// Creates an auto-playing promisified Primrose instance.
        auto: <T>(opts: Omit<IPrimrose<T>, 'onComplete'>) =>
            new Promise<void>((resolve) => Primrose.auto({ ...opts, onComplete: resolve }))
    };

    /********************
     *  PUBLIC METHODS  *
     ********************/

    /// Starts the tweening instance from the current progress point.
    start() {
        // do not attempt animating if already started
        if (this.m_running) return this;
        this.m_startTime = Date.now() - this.m_elapsed;
        this.m_running = true;
        this.m_animate();
        return this;
    }

    /// Pauses the Primrose instance.
    pause() {
        this.m_running = false;
        return this;
    }

    /// Resets the Primrose instance.
    reset() {
        this.m_running = false;
        this.m_elapsed = 0;
        this.m_current = JSON.parse(JSON.stringify(this.from));
        this.onUpdate(this.m_current);
        return this;
    }

    /******************
     *  INHERITABLES  *
     ******************/

    /// Update Inheritable.
    onUpdate(_: T) {}

    /// Completion Inheritable.
    onComplete() {}

    /*********************
     *  PRIVATE METHODS  *
     *********************/

    /// Validates the given tweening options.
    private m_validate() {}

    /// Animation Sequencer.
    private m_animate() {
        // if not playing then ignore
        if (!this.m_running) return;

        // determine the current elapsed time
        this.m_elapsed = Date.now() - this.m_startTime;
        this.m_scaledTime = this.duration > 0 ? this.m_elapsed / this.duration : 1;
        const progress = this.m_computeProgress();

        // update the tweenable values
        this.m_updateValues(progress, this.m_current, this.from, this.to);
        this.onUpdate(this.m_current); // call the user defined update method

        // if not completed yet then keep calling the animator
        if (this.m_scaledTime < 1) return scheduler.call(__root__, () => this.m_animate(), Primrose.INTERVAL);

        // otherwise stop running and call the `onComplete` method
        this.m_running = false;
        this.onComplete();
    }

    /// Updates all tweenable values.
    private m_updateValues(progress: number, obj: T, from: T, to: T) {
        for (const key of Object.keys(obj)) {
            // @ts-ignore : allow objects to be treated as expected
            if (typeof obj[key] === 'number') obj[key] = from[key] + (to[key] - from[key]) * progress;
            // @ts-ignore : again same as above
            else if (typeof obj[key] === 'object') this.m_updateValues(progress, obj[key], from[key], to[key]);
        }
    }

    /// Clamps the current easing value between 0 and 1.
    private m_computeProgress() {
        const val = this.easer(this.m_scaledTime); // current scaled time
        return val > 1 ? 1 : val < 0 ? 0 : val;
    }
}
