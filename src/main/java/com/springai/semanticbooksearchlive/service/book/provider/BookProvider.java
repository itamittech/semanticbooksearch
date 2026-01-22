package com.springai.semanticbooksearchlive.service.book.provider;

import com.springai.semanticbooksearchlive.model.Book;
import java.util.List;

public interface BookProvider {
    List<Book> fetchBooks();
}
