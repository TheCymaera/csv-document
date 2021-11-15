export class CSVDocument {
	columns: string[] = [];
	entries: Record<string, string>[] = [];

	serialize() {
		const serializedRows: string[] = [];

		for (const row of this.toArrays()) {
			const serializedCells: string[] = [];
			for (const cell of row) serializedCells.push(this._serializeCell(cell, format));
			serializedRows.push(serializedCells.join(format.delimiter));
		}

		return serializedRows.join(format.lineDelimiter);
	}

	toArrays() {
		const out: string[][] = [[...this.columns]];
		for (const record of this.entries) {
			const row: string[] = [];
			for (const column of this.columns) row.push(record[column] ?? "");
			out.push(row);
		}
		
		return out;
	}

	/**
	 * Byte Order Mark
	 * @example
	 * new Blob([CSVDocument.BOM.UTF8 + csvText])
	 */
	static readonly BOM = Object.freeze({
		UTF8: "\uFEFF"
	});

	static parse(text: string) {
		const rows: string[][] = [];
		let cell = "";
		let row: string[] = [];
		let inQuotes = false;
		
		rows.push(row);

		let i = 0;
		while (i  < text.length) {
			if (!inQuotes) {
				if (!cell && text.startsWith(format.quote, i)) {
					// enter quotes
					inQuotes = true;
					i += format.quote.length;
					continue;
				} else if (text.startsWith(format.delimiter, i)) {
					// new cell
					row.push(cell);
					cell = "";
					i += format.delimiter.length;
					continue;
				} else if (text.startsWith(format.lineDelimiter, i)) {
					// new row
					row.push(cell);
					cell = "";

					row = [];
					rows.push(row);
					i += format.lineDelimiter.length;
					continue;
				}
			} else {
				if (text.startsWith(format.quoteEscape, i)) {
					// escape quote
					cell += format.quote;
					i += format.quoteEscape.length;
					continue;
				} else if (text.startsWith(format.quote, i)) {
					// exit quote
					inQuotes = false;
					i += format.quote.length;
					continue;
				}
			}

			// add character to cell
			cell += text[i];
			i += 1;
		}

		row.push(cell);

		return this.fromArrays(rows);
	}

	static fromArrays(rows: string[][]): CSVDocument {
		const out = new CSVDocument;

		if (!rows.length) return out;

		out.columns = rows[0]!;
		for (let i = 1; i < rows.length; i++) {
			const row = rows[i]!;
			const record: Record<string, string> = {};
			out.entries.push(record);

			for (let i = 0; i < row.length; i++) {
				const column = out.columns[i]!;
				record[column] = row[i]!;
			}
		}
		
		return out;
	}

	private _serializeCell(cell: string, format: CSVDocument.Format) {
		if (!cell.includes(format.delimiter) && 
			!cell.includes(format.lineDelimiter) &&
			!cell.includes(format.quote)
		) return cell;
		return format.quote + cell.replaceAll(format.quote, format.quoteEscape) + format.quote;
	}
}

export namespace CSVDocument {
	export interface Format {
		delimiter: string;
		lineDelimiter: string;
		quote: string;
		quoteEscape: string;
	}
}

const format = Object.freeze({
	delimiter: ",",
	lineDelimiter: "\n",
	quote: '"',
	quoteEscape: '""',
});