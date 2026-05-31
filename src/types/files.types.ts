export interface PDFData{
    text:string;            // The Extracted raw text
    numpages:number;        // no . pages in original file
    numrendered: number;    // no . paged processed successfully
    info:any;               // Document metadata (Author etc)
    metadata:any;           // XML-based Metadata
    version?:string ;         // PDF version format
}