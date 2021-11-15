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
		price: "1",
	},
	{
		id: "1",
		name: "Banana",
		price: "2",
	},
	{
		id: "2",
		id: "Carrot",
		price: "3",
	},
];
```

## UFT8
```typescript
const csvText = CSVDocument.BOM.UTF8 + doc.serialize();
const blob = new Blob([csvText]);
```

## License
Licensed under MIT.<br/>
<br/>
All files can be used for commercial or non-commercial purposes. Do not resell. Attribution is appreciated but not due.