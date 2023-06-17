import { useState, useEffect } from "react"
import { Link as RouterLink } from "react-router-dom"
import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Modal,
  Card,
  CardContent,
  CardActions,
  Typography,
  TablePagination,
  TextField,
} from "@mui/material"
import { BackendApi } from "../../client/backend-api"
import { useUser } from "../../context/user-context"
import classes from "./styles.module.css"
import img from '../../images/back.jpg'

export const BooksList = () => {
  const [books, setBooks] = useState([])
  const [borrowedBook, setBorrowedBook] = useState([])
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [activeBookIsbn, setActiveBookIsbn] = useState("")
  const [openModal, setOpenModal] = useState(false)
  const { isAdmin, user } = useUser()
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState([])

  const fetchBooks = async () => {
    const { books } = await BackendApi.book.getAllBooks()
    setBooks(books)
  }

  const fetchUserBook = async () => {
    const { books } = await BackendApi.user.getBorrowBook()
    setBorrowedBook(books)
  }

  const deleteBook = () => {
    if (activeBookIsbn && books.length) {
      BackendApi.book.deleteBook(activeBookIsbn).then(({ success }) => {
        fetchBooks().catch(console.error)
        setOpenModal(false)
        setActiveBookIsbn("")
      })
    }
  }

  const handleSearch = () => {
    const results = books.filter(
      (book) =>
        book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.isbn.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setSearchResults(results)
  }

  useEffect(() => {
    fetchBooks().catch(console.error)
    fetchUserBook().catch(console.error)
  }, [user])

  return (
    <div className={`${classes.bookList}`}>
      <div className={`${classes.headerContent} flex flex-c text-center text-white`}>
        <h2 className={`${classes.headerTitle} text-capitalize`}>Find Book Of Your Choice.</h2><br />
        <div className={`${classes.searchBar}`}>
          <TextField
            className="textfield"
            label="Search"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{ className: `${classes.searchInput}` }} // Added this prop to set custom styles for the text field
          />
          <Button className={`${classes.searchButton}`} variant="contained" color="grey" onClick={handleSearch}>
            Search
          </Button>
        </div>
      </div>
      

      <div className={`${classes.pageHeader} ${classes.mb2}`}>
        <Typography variant="h5">Book List</Typography>
        {isAdmin && (
          <Button className="" variant="contained" color="primary" component={RouterLink} to="/admin/books/add">
            Add Book
          </Button>
        )}
      </div>
      {books.length > 0 ? (
        <div className={`${classes.listtab}`}>
          <div className={`${classes.tableContainer}`}>
            <TableContainer component={Paper}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Author</TableCell>
                    <TableCell align="right">ISBN</TableCell>
                    <TableCell align="right">Category</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Available</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(rowsPerPage > 0
                    ? (searchTerm.length > 0 ? searchResults : books).slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage
                      )
                    : searchTerm.length > 0
                    ? searchResults
                    : books
                  ).map((book) => (
                    <TableRow key={book.isbn}>
                      <TableCell component="th" scope="row">
                        {book.name}
                      </TableCell>
                      <TableCell>{book.author}</TableCell>
                      <TableCell align="right">{book.isbn}</TableCell>
                      <TableCell align="right">{book.category}</TableCell>
                      <TableCell align="right">{book.quantity}</TableCell>
                      <TableCell align="right">{book.availableQuantity}</TableCell>
                      <TableCell align="right">{`$${book.price}`}</TableCell>
                      <TableCell>
                        <div className={classes.actionsContainer}>
                          <Button
                            variant="contained"
                            component={RouterLink}
                            size="small"
                            to={`/books/${book.isbn}`}
                          >
                            View
                          </Button>
                          {isAdmin && (
                            <>
                              <Button
                                variant="contained"
                                color="primary"
                                component={RouterLink}
                                size="small"
                                to={`/admin/books/${book.isbn}/edit`}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="contained"
                                color="secondary"
                                size="small"
                                onClick={(e) => {
                                  setActiveBookIsbn(book.isbn)
                                  setOpenModal(true)
                                }}
                              >
                                Delete
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10))
                setPage(0)
              }}
              component="div"
              count={books.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
            />
            <Modal open={openModal} onClose={(e) => setOpenModal(false)}>
              <Card className={classes.conf_modal}>
                <CardContent>
                  <h2>Are you sure?</h2>
                </CardContent>
                <CardActions className={classes.conf_modal_actions}>
                  <Button variant="contained" onClick={() => setOpenModal(false)}>
                    Cancel
                  </Button>
                  <Button variant="contained" color="secondary" onClick={deleteBook}>
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Modal>
          </div>
        </div>
      ) : (
        <Typography variant="h5">No books found!</Typography>
      )}

      {user && !isAdmin && (
        <div className={`${classes.borrowed}`}>
          <div className={`${classes.pageHeader} ${classes.mb2}`}>
            <Typography variant="h5">Borrowed Books</Typography>
          </div>
          {borrowedBook.length > 0 ? (
            <>
              <div className={classes.tableContainer}>
                <TableContainer component={Paper}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Author</TableCell>
                        <TableCell align="right">ISBN</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell align="right">Price</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {borrowedBook.map((book) => (
                        <TableRow key={book.isbn}>
                          <TableCell component="th" scope="row">
                            {book.name}
                          </TableCell>
                          <TableCell>{book.author}</TableCell>
                          <TableCell align="right">{book.isbn}</TableCell>
                          <TableCell>{book.category}</TableCell>
                          <TableCell align="right">{`$${book.price}`}</TableCell>
                          <TableCell>
                            <div className={classes.actionsContainer}>
                              <Button
                                variant="contained"
                                component={RouterLink}
                                size="small"
                                to={`/books/${book.isbn}`}
                              >
                                View
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>
            </>
          ) : (
            <Typography variant="h5">No books issued!</Typography>
          )}
        </div>
      )}
    </div>
  )
}