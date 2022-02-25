export type TerminalConstructorData = {
	[Key in keyof TerminalData]?: TerminalData[Key];
};

export interface TerminalData {
	showLevelName: boolean;
	showRelativeTimestamp: boolean;
	showTimestamp: boolean;
	showTimestampRelativeToLastLog: boolean;
}

export class Terminal {
	readonly data: TerminalData;
	readonly startTime: number;

	constructor(data?: TerminalConstructorData) {
		const defaultData = {
			showLevelName: false,
			showRelativeTimestamp: true,
			showTimestamp: true,
			showTimestampRelativeToLastLog: true
		};

		this.startTime = Date.now();
		this.data = data ? Object.assign({}, defaultData, data) : defaultData;
	}
}
