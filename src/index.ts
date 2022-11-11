export class CSVDocument {
	columns: string[] = [];
	entries: Record<string, CSVDocument.Value>[] = [];

	serialize(format?: Partial<CSVDocument.Format>) {
		const f = {...defaultFormat, ...format};

		const serializedRows: string[] = [];

		for (const row of this.toArrays()) {
			const serializedCells: string[] = [];
			for (const cell of row) serializedCells.push(_serializeCell(cell, f));
			serializedRows.push(serializedCells.join(f.delimiter));
		}

		return serializedRows.join(f.lineDelimiter);
	}

	toArrays() {
		const out: CSVDocument.Value[][] = [[...this.columns]];
		for (const record of this.entries) {
			const row: CSVDocument.Value[] = [];
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

	static parse(text: string, format?: Partial<CSVDocument.Format>) {
		const f = {...defaultFormat, ...format};
		
		const rows: CSVDocument.Value[][] = [];
		let cell = "";
		let row: CSVDocument.Value[] = [];
		let inQuotes = false;
		
		rows.push(row);

		let i = 0;
		while (i  < text.length) {
			if (!inQuotes) {
				if (!cell && text.startsWith(f.quote, i)) {
					// enter quotes
					inQuotes = true;
					cell += f.quote;
					i += f.quote.length;
					continue;
				} else if (text.startsWith(f.delimiter, i)) {
					// new cell
					row.push(_deserializeCell(cell, f));
					cell = "";
					i += f.delimiter.length;
					continue;
				} else if (text.startsWith(f.lineDelimiter, i)) {
					// new row
					row.push(_deserializeCell(cell, f));
					cell = "";

					row = [];
					rows.push(row);
					i += f.lineDelimiter.length;
					continue;
				}
			} else {
				if (text.startsWith(f.quoteEscape, i)) {
					// escape quote
					cell += f.quoteEscape;
					i += f.quoteEscape.length;
					continue;
				} else if (text.startsWith(f.quote, i)) {
					// exit quote
					inQuotes = false;
					cell += f.quote;
					i += f.quote.length;
					continue;
				}
			}

			// add character to cell
			cell += text[i];
			i += 1;
		}

		row.push(_deserializeCell(cell, f));
		
		return CSVDocument.fromArrays(rows);
	}

	static fromArrays(rows: CSVDocument.Value[][]): CSVDocument {
		const out = new CSVDocument;

		if (!rows.length) return out;

		// first row are columns
		out.columns = rows[0]!.map(i=>`${i}`);

		// subsequent rows are entries
		for (let i = 1; i < rows.length; i++) {
			const row = rows[i]!;
			const record: CSVDocument["entries"][0] = {};
			out.entries.push(record);

			for (let i = 0; i < row.length; i++) {
				const column = out.columns[i]!;
				record[column] = row[i]!;
			}
		}
		
		return out;
	}
}

export namespace CSVDocument {
	export interface Format {
		delimiter: string;
		lineDelimiter: string;
		quote: string;
		quoteEscape: string;
		allowUnescapedQuotes: boolean;
	}

	export type Value = string|number;
}

const defaultFormat = Object.freeze({
	delimiter: ",",
	lineDelimiter: "\n",
	quote: '"',
	quoteEscape: '""',
	allowUnescapedQuotes: true,
}) as Readonly<CSVDocument.Format>;

function _serializeCell(cell: CSVDocument.Value, format: CSVDocument.Format) {
	// number
	if (typeof cell === "number") return cell.toString();

	// number-like string
	if (!isNaN(parseFloat(cell))) return _escapeString(cell, format);

	// escape delimiters
	if (cell.includes(format.delimiter) ||
		cell.includes(format.lineDelimiter)
	) {
		return _escapeString(cell, format);
	}

	// escape quotes
	if (cell.includes(format.quote) && 
		!(format.allowUnescapedQuotes && !cell.startsWith(format.quote))
	) return _escapeString(cell, format);

	// string
	return cell;
}

function _deserializeCell(cell: string, format: CSVDocument.Format): CSVDocument.Value {
	// quoted string
	if (cell.startsWith(format.quote)) return cell
	.slice(format.quote.length, -format.quote.length)
	.replaceAll(format.quoteEscape, format.quote);

	// number
	if (!isNaN(parseFloat(cell))) return	parseFloat(cell);

	// string
	return cell;
}

function _escapeString(cell: string, format: CSVDocument.Format) {
	return format.quote + cell.replaceAll(format.quote, format.quoteEscape) + format.quote;
}