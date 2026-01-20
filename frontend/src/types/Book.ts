
export interface Book {
    id: string;
    title: string;
    author: string;
    summary: string;
    genre: string;
    publicationYear: number;
    imageUrl?: string;
}

export interface SearchResult {
    book: Book;
    score: number;
}

export interface HybridSearchResponse {
    vectorResults: SearchResult[];
    keywordResults: SearchResult[];
    hybridResults: SearchResult[];
}
