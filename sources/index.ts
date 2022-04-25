import C from "kleur";
import { Color, Level, TerminalConstructorData, TerminalData } from "./types";

export { Level, TerminalConstructorData, TerminalData };

export const advancedLevels: Level<"debug" | "error" | "fatal" | "info" | "trace" | "warn">[] = [
	{ color: ["black", "bold"], isError: false, name: "trace" },
	{ color: ["black", "bold", "underline"], isError: false, name: "debug" },
	{ color: ["blue", "bold"], isError: false, name: "info" },
	{ color: ["yellow", "dim", "underline"], isError: true, name: "warn" },
	{ color: ["red", "underline"], isError: true, name: "error" },
	{ color: ["bgRed", "white", "bold"], isError: true, name: "fatal" }
];

export const basicLevels: Level<"error" | "trace">[] = [
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
		const {
			capitalizeLevelName,
			showArrow,
			showDate,
			showLevelName,
			showMonthBeforeDay,
			showRelativeTimestamp,
			showTimestamp,
			showTimestampRelativeToLastLog,
			use24HourClock
		} = this.data;

		const time = new Date();
		const color = getColorApplier("TEXT", "white");
		const colorBG = getColorApplier("BACKGROUND", "bgBlack");
		let monthPositionSwitch = showMonthBeforeDay;
		let output = "";

		function formatChangeInTime(from: Date, prefix: string) {
			let formattedChangeInTime = " ";
			let remainder = time.getTime() - from.getTime();

			function addUnitOfTime(unitValueInMilliseconds: number, unitName: string) {
				const unitCount = Math.floor(remainder / unitValueInMilliseconds);

				remainder = remainder % unitValueInMilliseconds;
				formattedChangeInTime += unitCount !== 0 ? color(prefix + unitCount + unitName) + " " : unitValueInMilliseconds === 1 ? color(prefix + "0") + " " : "";
			}

			addUnitOfTime(31536000000, "y"); // YEARS
			addUnitOfTime(2592000000, "m"); // MONTHS
			addUnitOfTime(86400000, "d"); // DAYS
			addUnitOfTime(3600000, "h"); // HOURS
			addUnitOfTime(60000, "min"); // MINUTES
			addUnitOfTime(1000, "s"); // SECONDS
			addUnitOfTime(1, "ms"); // MILLISECONDS

			return colorBG(formattedChangeInTime);
		}

		function formatMonth() {
			monthPositionSwitch = !monthPositionSwitch;
			return monthPositionSwitch ? "" : `${time.getMonth()}m/`;
		}

		function getColorApplier(colorType: "BACKGROUND" | "TEXT", altColor: Color) {
			const colors = level.color.filter((colorString) => {
				const isBackground = colorString.startsWith("bg");

				return colorType === "BACKGROUND" ? isBackground : !isBackground;
			});

			let color = C[colors[0] || altColor];

			for (let i = 1; i < colors.length; i++) color = color()[colors[i]];
			return color;
		}

		// Should look like: [ ERROR ] or [ error ]
		if (showLevelName) output += `[${colorBG(" " + color(capitalizeLevelName ? level.name.toUpperCase() : level.name) + " ")}]\t`;

		// Should look like: [ 12d/5m/2011y | 13:43:10.23 ] or [ 5m/12d/2011y | 1:43:10.23 PM ]
		if (showDate || showTimestamp) {
			output += "[";
			if (showDate) output += colorBG(" " + color(`${formatMonth() + time.getDate()}d/${formatMonth()}${time.getFullYear()}y`) + " ");
			if (showDate && showTimestamp) output += "|";

			if (showTimestamp) {
				const hours = time.getHours();

				output += colorBG(
					" " +
						color(
							`${use24HourClock || !(hours >= 13 || hours === 0) ? hours : Math.abs(hours - 12)}:${time.getMinutes()}:${time.getSeconds()}.${time.getMilliseconds()}`
						) +
						" " +
						(use24HourClock ? "" : color(hours >= 13 ? "PM" : "AM") + " ")
				);
			}

			output += "]";
		}

		if ((showDate || showTimestamp) && (showRelativeTimestamp || showTimestampRelativeToLastLog)) output += "\t";

		// Should look like: [ 5y 1m 15h 51min 7s 300ms | +31min +5s +903ms ]
		if (showRelativeTimestamp || showTimestampRelativeToLastLog) {
			output += "[";
			if (showRelativeTimestamp) output += formatChangeInTime(this.startTime, "");
			if (showRelativeTimestamp && showTimestampRelativeToLastLog) output += "|";
			if (showTimestampRelativeToLastLog) output += formatChangeInTime(this.timeInLastLog, "+");
			output += "]";
		}

		// Should look like: >>
		if (showArrow) output += ` ${C.bold(">>")}\t`;

		output += `\t${message}\n`;
		(level.isError ? process.stderr : process.stdout).write(output);
		this.timeInLastLog = time;
	}

	constructor(data: TerminalConstructorData<L>) {
		const defaultData: Omit<TerminalData, "levels"> = {
			capitalizeLevelName: true,
			showArrow: false,
			showDate: false,
			showLevelName: false,
			showMonthBeforeDay: false,
			showRelativeTimestamp: false,
			showTimestamp: true,
			showTimestampRelativeToLastLog: true,
			use24HourClock: false
		};

		let logger: object = {};
		let registeredLevels: string[] = [];

		this.startTime = new Date();
		this.timeInLastLog = this.startTime;
		this.data = Object.assign({}, defaultData, data);

		for (const level of data.levels) {
			if (registeredLevels.some((value) => value === level.name)) throw new Error(`Duplicate level name "${level.name}".`);
			registeredLevels = [...registeredLevels, level.name];

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
