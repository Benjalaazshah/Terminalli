import { Kleur } from "kleur";

export type Color2 = keyof Kleur;

export interface Level {
	color: Color2[];
	name: string;
}

/**
 * Customization options for the `Terminal` class.
 */
export interface TerminalData {
	levels: Level[];

	/**
	 * If true, each message logged to the terminal will have a date corresponding to when the message was logged attached to it.
	 *
	 * `[ 12d/5m/2011y ] foo`
	 */
	showDate: boolean;

	/**
	 * If true, each message logged to the terminal will have the name of the level of the message attached to it.
	 *
	 * `[ ERROR ] WHAT WILL I DO?!`
	 */
	showLevelName: boolean;

	/**
	 * If true, each message logged to the terminal will have a timestamp relative to the creation of this particular instance of the `Terminal` class to which this message has been logged.
	 *
	 * `[ 5y 1m 15h 51min 7s 300ms ] A long time has passed.`
	 */
	showRelativeTimestamp: boolean;

	/**
	 * If true, each message logged to the terminal will have a timestamp corresponding to the exact time the message was logged.
	 *
	 * `[ 13:43:10.23 ] bar`
	 */
	showTimestamp: boolean;

	/**
	 * If true, each message logged to the terminal will have a timestamp relative to when the previous message was logged to the terminal.

	 * `[ +31min +5s +903ms ] It took forever!`
	 */
	showTimestampRelativeToLastLog: boolean;
}
