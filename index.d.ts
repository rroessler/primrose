/**************
 *  TYPEDEFS  *
 **************/

/** Tweening Method Implementation Type. */
type EasingMethod = (time: number) => number;

/** Easing Kinds Available (excluding LINEAR). */
type EasingKind = 'QUAD' | 'CUBIC' | 'QUART' | 'QUINT' | 'SINE' | 'EXPO' | 'CIRC';

/** Easing Kinds Map (excluding LINEAR). */
type EasingKindGroupMap = {
    [K in EasingKind]: {
        IN: EasingMethod;
        OUT: EasingMethod;
        IN_OUT: EasingMethod;
    };
};

/** All Easings Available. */
type Easing = { LINEAR: EasingMethod } & EasingKindGroupMap;

/**
 * Primrose Constructor Options.
 * @tparam                  Tweenable Object Type.
 */
interface IPrimrose<T> {
    /** From Tweenable. */
    from: T;
    /** To Tweenable. */
    to: T;
    /** Tween Duration. */
    duration?: number;
    /** Easing Method to use. */
    easer?: EasingMethod;
    /** User Update Functionality. */
    onUpdate?: (val: T) => void;
    /** On Completion Functionality. */
    onComplete?: () => void;
}

/********************
 *  IMPLEMENTATION  *
 ********************/

/**
 * Primrose Tweening Class.
 * @tparam                  Tweenable Object Type.
 */
export declare class Primrose<T> implements IPrimrose<T> {
    /** From Tweenable. */ from: T;
    /** To Tweenable. */ to: T;
    /** Tween Duration. */ duration?: number;
    /** Easing Method to use. */ easer?: EasingMethod;

    /** All available easings methods. */
    static readonly easing: Easing;

    /** User Update Functionality. */ onUpdate?: (val: T) => void;
    /** On Completion Functionality. */ onComplete?: () => void;

    /**
     * Constructs a new Primrose tweening instance.
     * @param opts                  Tween Options.
     */
    static create<T>(opts: IPrimrose<T>): Primrose<T>;

    /**
     * Constructs a new auto-playing Primrose tweening instance.
     * @param opts                  Tween Options.
     */
    static auto<T>(opts: IPrimrose<T>): Primrose<T>;

    /** Promisified Primrose Constructors. */
    static promises: {
        /**
         * Constructs a promisified Primrose tweening instance.
         * @param opts                  Tween Options.
         */
        create: <T>(opts: Omit<IPrimrose<T>, 'onComplete'>) => { start: () => Promise<void> };

        /**
         * Constructs a promisified auto-playing Primrose tweening instance.
         * @param opts                  Tween Options.
         */
        auto: <T>(opts: Omit<IPrimrose<T>, 'onComplete'>) => Promise<void>;
    };

    /** Starts the Primrose tweening instance. */ start(): Primrose<T>;
    /** Pauses the Primrose tweening instance. */ pause(): Primrose<T>;
    /** Resets the Primrose tweening instance. */ reset(): Primrose<T>;
}
