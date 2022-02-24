export type TerminalConstructorData = {
	[Key in keyof TerminalData]?: TerminalData[Key];
};

export interface TerminalData {
	showLevelName: boolean;
	showRelativeTimestamp: boolean;
	showTimestamp: boolean;
	showTimestampRelativeToLastLog: boolean;
}
