import C from "kleur";

/**
 * Customization options for the `Terminal` class.
 */
export interface TerminalData {
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

	showMonthBeforeDay: boolean;

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

	use24HourClock: boolean;
}

/**
 * Represents the console.
 */
export default class Terminal {
	/**
	 * Customization options that were inputted when this terminal instance was created.
	 */
	readonly data: TerminalData;

	/**
	 * The time when this terminal instance was created.
	 */
	readonly startTime: Date;

	/**
	 * The time when the last message was logged to the terminal.
	 */
	timeInLastLog: Date;

	private _log(level: "ERROR" | "LOG", message: string) {
		const { showDate, showLevelName, showMonthBeforeDay, showRelativeTimestamp, showTimestamp, showTimestampRelativeToLastLog, use24HourClock } = this.data;
		const time = new Date();
		let monthPositionSwitch = showMonthBeforeDay;
		let output = "";
		const levelColor = level === "ERROR" ? (x: string) => C.underline().dim().red(x) : (x: string) => C.bold().black(x);

		function formatChangeInTime(from: Date, prefix: string) {
			let formattedChangeInTime = "";
			let remainder = time.getTime() - from.getTime();

			function addUnitOfTime(unitValueInMilliseconds: number, unitName: string) {
				const unitCount = Math.floor(remainder / unitValueInMilliseconds);

				remainder = remainder % unitValueInMilliseconds;
				formattedChangeInTime += unitCount !== 0 ? levelColor(prefix + unitCount + unitName) + " " : "";
			}

			addUnitOfTime(31536000000, "y"); // YEARS
			addUnitOfTime(2592000000, "m"); // MONTHS
			addUnitOfTime(86400000, "d"); // DAYS
			addUnitOfTime(3600000, "h"); // HOURS
			addUnitOfTime(60000, "min"); // MINUTES
			addUnitOfTime(1000, "s"); // SECONDS
			addUnitOfTime(1, "ms"); // MILLISECONDS

			return formattedChangeInTime;
		}

		function formatMonth() {
			monthPositionSwitch = !monthPositionSwitch;
			return monthPositionSwitch ? "" : `${time.getMonth()}m/`;
		}

		// Should look like: [ ERROR ]
		if (showLevelName) output += `[ ${levelColor(level)} ]\t`;

		// Should look like: [ 12d/5m/2011y | 13:43:10.23 ] or [ 5m/12d/2011y | 1:43:10.23 PM ]
		if (showDate || showTimestamp) {
			output += "[ ";
			if (showDate) output += levelColor(`${formatMonth() + time.getDate()}d/${formatMonth()}${time.getFullYear()}y`) + " ";
			if (showDate && showTimestamp) output += "| ";

			if (showTimestamp) {
				const hours = time.getHours();

				output +=
					levelColor(
						`${use24HourClock || !(hours >= 13 || hours === 0) ? hours : Math.abs(hours - 12)}:${time.getMinutes()}:${time.getSeconds()}.${time.getMilliseconds()}`
					) + " ";

				if (!use24HourClock) output += levelColor(hours >= 13 ? "PM" : "AM") + " ";
			}

			output += "]\t";
		}

		// Should look like: [ 5y 1m 15h 51min 7s 300ms | +31min +5s +903ms ]
		if (showRelativeTimestamp || showTimestampRelativeToLastLog) {
			output += "[ ";
			if (showRelativeTimestamp) output += formatChangeInTime(this.startTime, "");
			if (showRelativeTimestamp && showTimestampRelativeToLastLog) output += "| ";
			if (showTimestampRelativeToLastLog) output += formatChangeInTime(this.timeInLastLog, "+");
			output += "]\t";
		}

		output += `${message}\n`;
		(level === "ERROR" ? process.stderr : process.stdout).write(output);
		this.timeInLastLog = time;
	}

	/**
	 * Logs a message to the `process.stdout`.
	 * @param message The message to be logged to the terminal.
	 */
	log(message: string) {
		this._log("LOG", message);
	}

	/**
	 * Logs an error message to `process.stderr`.
	 * @param errorMessage The error message to be logged to the terminal.
	 */
	error(errorMessage: string) {
		this._log("ERROR", errorMessage);
	}

	/**
	 * Represents the console.
	 * @param data Customization options for the terminal.
	 */
	constructor(data?: Partial<TerminalData>) {
		const defaultData: TerminalData = {
			showDate: true,
			showLevelName: false,
			showMonthBeforeDay: false,
			showRelativeTimestamp: true,
			showTimestamp: true,
			showTimestampRelativeToLastLog: true,
			use24HourClock: true
		};

		this.startTime = new Date();
		this.timeInLastLog = this.startTime;
		this.data = data ? Object.assign({}, defaultData, data) : defaultData;
	}
}
