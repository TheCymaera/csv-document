# CSVDocument

## Introduction
CSVDocument is a library for working with CSV documents.

## Installation
Install via [npm](https://www.npmjs.com/package/csv-document):
```shell
npm install csv-document
```

## Parsing
```typescript
import { CSVDocument } from "csv-document"; 
const doc = CSVDocument.parse(csvText);
```

## Serializing
```typescript
const csvText = doc.serialize()
```

## Editing
```typescript
doc.columns = ["id", "name", "price"];
doc.entries = [
	{
		id: "0",
		name: "Apple",
		price: 1,
	},
	{
		id: "1",
		name: "Banana",
		price: 2,
	},
	{
		id: "2",
		id: "Carrot",
		price: 3,
	},
];
```

## UTF8
```typescript
const csvText = doc.serialize();
const blob = new Blob([CSVDocument.BOM.UTF8 + csvText]);
```

## CSV Syntax
Strings:
```
Hello World
```

Numbers: 
```json
123
```

Number-like strings:
```json
"123"
```

Escaped string with delimiters:
```json
"Hello, World"
```

Escaped string with quotes:
```json
"""This string surrounded by quotes"""
```

Unescaped string with quotes:
```
Quote: "
```
(Only strings beginning with quotes need to be escaped.)

## License
Licensed under MIT.<br/>
<br/>
All files can be used for commercial or non-commercial purposes. Do not resell. Attribution is appreciated but not due.