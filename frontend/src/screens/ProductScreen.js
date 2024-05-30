import axios from 'axios';
import React, {
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ListGroup from 'react-bootstrap/ListGroup';
import Card from 'react-bootstrap/Card';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Rating from '../components/Rating';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { getError } from './utils';
import { Store } from '../Store';
import { toast } from 'react-toastify';

//reducer function

const reducer = (state, action) => {
  switch (action.type) {
    case 'REFRESH_PRODUCT':
      return { ...state, product: action.payload };
    case 'CREATE_REQUEST':
      return { ...state, loadingCreateReview: true };
    case 'CREATE_SUCCESS':
      return { ...state, loadingCreateReview: false };
    case 'CREATE_FAIL':
      return { ...state, loadingCreateReview: false };
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, product: action.payload, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default function ProductScreen() {
  let reviewsRef = useRef();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedImage, setSelectedImage] = useState('');

  const navigate = useNavigate();
  const params = useParams();
  const { slug } = params;

  const [{ loading, error, product}, dispatch] =
    useReducer(reducer, {
      product: [],
      loading: true,
      error: '',
    });
  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        const result = await axios.get(`/api/products/slug/${slug}`);
        dispatch({ type: 'FETCH_SUCCESS', payload: result.data });
      } catch (error) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(error) });
      }
    };
    fetchData();
  }, [slug]);

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { cart, userInfo } = state;

  const addToCartHandler = async () => {
    const itemExist = cart.cartItems.find((x) => x._id === product._id);
    const quantity = itemExist ? itemExist.quantity + 1 : 1;
    const { data } = await axios.get(`/api/products/${product._id}`);
    toast.success('Product is added to your cart')
    if (data.countInStock < quantity) {
      window.alert('Sorry. This product is out of stock');
      return;
    }
    ctxDispatch({
      type: 'CART_ADD_ITEM',
      payload: { ...product, quantity },
    });
    navigate('/cart');
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!comment || !rating) {
      toast.error('Please enter comment and rating');
      return;
    }
    try {
      const { data } = await axios.post(
        `/api/products/${product._id}/reviews`,
        { rating, comment, name: userInfo.name },
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );

      dispatch({
        type: 'CREATE_SUCCESS',
      });
      toast.success('Review sended successfully');
      product.reviews.unshift(data.review);
      product.numReviews = data.numReviews;
      product.rating = data.rating;
      dispatch({ type: 'REFRESH_PRODUCT', payload: product });
      window.scrollTo({
        behavior: 'smooth',
        top: reviewsRef.current.offsetTop,
      });
    } catch (error) {
      toast.error(getError(error));
      dispatch({ type: 'CREATE_FAIL' });
    }
  };

  return loading ? (
    <LoadingBox />
  ) : error ? (
    <MessageBox variant="danger">{error}</MessageBox>
  ) : (
    <div>
      <Container>
        <Row>
          <Col md={6}>
            <img
              className="img-large"
              src={selectedImage || product.image}
              alt={product.name}
            />
          </Col>
          <Col md={3}>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <Helmet>
                  <title>{product.name}</title>
                </Helmet>
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>{product.name}</strong>
              </ListGroup.Item>
              <ListGroup.Item>
                <Rating
                  rating={product.rating}
                  numReviews={product.numReviews}
                ></Rating>
              </ListGroup.Item>
              <ListGroup.Item>
                Price : <strong>{product.price}$</strong>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row xs={1} md={2} className="g-2">
                  {[product.image, ...product.images].map((x) => (
                    <Col key={x}>
                      <Card>
                        <Button
                          className="thumbnail"
                          type="button"
                          variant="light"
                          onClick={() => setSelectedImage(x)}
                        >
                          <Card.Img variant="top" src={x} alt="product" />
                        </Button>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                Description : <p>{product.description}</p>
              </ListGroup.Item>
            </ListGroup>
          </Col>
          <Col md={3}>
            <Card className='mt-2'>
              <Card.Body>
                <ListGroup variant="flush">
                  <ListGroup.Item>
                    Price : <strong> {product.price}$</strong>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <Row>
                      <Col>Status:</Col>
                      <Col>
                        {product.countInStock > 0 ? (
                          <Badge bg="success">In Stock</Badge>
                        ) : (
                          <Badge bg="danger">Not Available</Badge>
                        )}
                      </Col>
                    </Row>
                  </ListGroup.Item>
                  {product.countInStock > 0 && (
                    <ListGroup.Item>
                      <div className="d-grid">
                        {userInfo?.isAdmin ? (
                          <Button variant="light" disabled>
                            Add to cart
                          </Button>
                        ) : (
                          <Button
                            variant="outline-primary"
                            onClick={addToCartHandler}
                          >
                            Add to Cart
                          </Button>
                        )}
                      </div>
                    </ListGroup.Item>
                  )}
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <div className="my-3">
          <h2 ref={reviewsRef}>Reviews ({product.numReviews})</h2>
          <div className="mb-3">
            {product.reviews.length === 0 && (
              <MessageBox>There is no review</MessageBox>
            )}
          </div>
          <ListGroup>
            {product.reviews.map((review) => (
              <ListGroup.Item key={review._id}>
                <strong>{review.name}</strong>
                <Rating rating={review.rating} caption=" "></Rating>
                <p>{new Date(review.createdAt).toLocaleDateString()} - {new Date(review.createdAt).toLocaleTimeString()}</p>
                <p>{review.comment}</p>
      
              </ListGroup.Item>
            ))}
          </ListGroup>
          <div className="my-3">
            {userInfo ? (
              <form onSubmit={submitHandler}>
                <h2>Your review</h2>
                <div className="d-flex flex-row gap-3 align-items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Button
                      key={i}
                      variant={i + 1 <= rating ? 'warning' : 'outline-warning'}
                      onClick={() => setRating(i + 1)}
                      size="sm"
                      style={{ borderRadius: '50%' }}
                    >
                      <i className="fas fa-star"></i>
                    </Button>
                  ))}
                </div>
                <FloatingLabel
                  controlId="floatingTextarea"
                  label="Comments"
                  className="mt-3"
                >
                  <Form.Control
                    as="textarea"
                    placeholder="Share your thoughts and experiences"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    style={{ borderRadius: '4px' }}
                  />
                  <Button
                    type="submit"
                    variant="outline-primary"
                    className="review-form-submit-icon"
                  >
                    <i className="fas fa-paper-plane"></i> Send
                  </Button>
                </FloatingLabel>
              </form>
            ) : (
              <MessageBox>
                Please{' '}
                <Link to={`/signin?redirect=/product/${product.slug}`}>
                  Sign In
                </Link>{' '}
                to write a review
              </MessageBox>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
