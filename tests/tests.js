//@ts-check
import { CSVDocument } from "../dst/index.js";

const docString = `
c1,c2,c3,c4
1,"2",3,4
Quote: ","Delimiter: ,","New line: 
","""Quoted"""
`.trim()


console.group("Parsing:")
const doc = CSVDocument.parse(docString);
console.log(doc);
console.groupEnd()


console.group("Serializing:")
const serialized = doc.serialize();
console.log(serialized);
console.groupEnd()

console.group("Checks:")
console.log("Identical to original:", serialized === docString);
console.groupEnd()

console.log(CSVDocument.BOM.UTF8);