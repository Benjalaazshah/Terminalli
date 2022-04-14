import C from "kleur";
import { Level, TerminalConstructorData, TerminalData } from "./types";

export const basicLevels = [
	{ color: ["black", "bold"], name: "trace", isError: false },
	{ color: ["red", "underline"], name: "error", isError: true }
];

/**
 * Represents the console.
 */
export default class Terminal<L extends string> {
	/**
	 * Customization options that were inputted when this terminal instance was created.
	 */
	readonly data: TerminalData;
	readonly log: Record<L, (message: string) => void>;

	/**
	 * The time when this terminal instance was created.
	 */
	readonly startTime: Date;

	/**
	 * The time when the last message was logged to the terminal.
	 */
	timeInLastLog: Date;

	private _log(level: Level<string>, message: string) {
		const { showDate, showLevelName, showMonthBeforeDay, showRelativeTimestamp, showTimestamp, showTimestampRelativeToLastLog, use24HourClock } = this.data;
		const time = new Date();
		let levelColor = C[level.color[0]];
		let monthPositionSwitch = showMonthBeforeDay;
		let output = "";

		function formatChangeInTime(from: Date, prefix: string) {
			let formattedChangeInTime = "";
			let remainder = time.getTime() - from.getTime();

			function addUnitOfTime(unitValueInMilliseconds: number, unitName: string) {
				const unitCount = Math.floor(remainder / unitValueInMilliseconds);

				remainder = remainder % unitValueInMilliseconds;
				formattedChangeInTime += unitCount !== 0 ? levelColor(prefix + unitCount + unitName) + " " : unitValueInMilliseconds === 1 ? levelColor(prefix + "0") + " " : "";
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

		for (let i = 1; i < level.color.length; i++) levelColor = levelColor()[level.color[i]];

		// Should look like: [ ERROR ]
		if (showLevelName) output += `[ ${levelColor(level.name)} ]\t`;
		function formatMonth() {
			monthPositionSwitch = !monthPositionSwitch;
			return monthPositionSwitch ? "" : `${time.getMonth()}m/`;
		}

		// Should look like: [ ERROR ]
		if (showLevelName) output += `[ ${levelColor(level.name)} ]\t`;

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
		(level.isError ? process.stderr : process.stdout).write(output);
		this.timeInLastLog = time;
	}

	constructor(data: TerminalConstructorData<L>) {
		const defaultData: TerminalData = {
			levels: [
				{ color: ["black", "bold"], name: "trace", isError: false },
				{ color: ["red", "underline"], name: "error", isError: true }
			],

			showDate: true,
			showLevelName: false,
			showMonthBeforeDay: false,
			showRelativeTimestamp: true,
			showTimestamp: true,
			showTimestampRelativeToLastLog: true,
			use24HourClock: true
		};

		let logger: object = {};

		this.startTime = new Date();
		this.timeInLastLog = this.startTime;
		this.data = Object.assign({}, defaultData, data);

		for (const level of this.data.levels) {
			logger = {
				...logger,
				[level.name]: (message: string) => {
					this._log(level, message);
				}
			};
		}

		this.log = logger as Record<L, (message: string) => void>;
	}
}
