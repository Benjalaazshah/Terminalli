import { Kleur } from "kleur";

export type Color = keyof Kleur;
export type TerminalData = Required<TerminalConstructorData<string>>;

export interface Level<L extends string> {
	color: Color[];
	isError: boolean;
	name: L;
}

/**
 * Customization options for the `Terminal` class.
 */
export interface TerminalConstructorData<L extends string> {
	levels: Level<L>[];

	/**
	 * If true, each message logged to the terminal will have a date corresponding to when the message was logged attached to it.
	 *
	 * `[ 12d/5m/2011y ] foo`
	 */
	showDate?: boolean;

	/**
	 * If true, each message logged to the terminal will have the name of the level of the message attached to it.
	 *
	 * `[ ERROR ] WHAT WILL I DO?!`
	 */
	showLevelName?: boolean;

	/**
	 * If true, the date on each message logged to the console (which only exists if `showDate` is also true) will have the month before the day.
	 *
	 * **Day before month:**
	 *
	 * `[ 20d/12m/1999y ] loy`
	 *
	 * **Month before day:**
	 *
	 * `[ 12m/20d/1999y ] loy`
	 */
	showMonthBeforeDay?: boolean;

	/**
	 * If true, each message logged to the terminal will have a timestamp relative to the creation of this particular instance of the `Terminal` class to which this message has been logged.
	 *
	 * `[ 5y 1m 15h 51min 7s 300ms ] A long time has passed.`
	 */
	showRelativeTimestamp?: boolean;

	/**
	 * If true, each message logged to the terminal will have a timestamp corresponding to the exact time the message was logged.
	 *
	 * `[ 13:43:10.23 ] bar`
	 */
	showTimestamp?: boolean;

	/**
	 * If true, each message logged to the terminal will have a timestamp relative to when the previous message was logged to the terminal.
	 * `[ +31min +5s +903ms ] It took forever!`
	 */
	showTimestampRelativeToLastLog?: boolean;

	/**
	 * If true, the timestamp on each message logged to the console (which only exists if `showTimestamp` is true) will be displayed using the 24 hour clock instead of the 12 hour clock.
	 *
	 * **24 hour clock:**
	 *
	 * `[ 13:27:55.33 ] pow`
	 *
	 * **12 hour clock:**
	 *
	 * `[ 1:27:55.33 PM ] pow`
	 */
	use24HourClock?: boolean;
}
