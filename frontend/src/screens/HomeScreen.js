import React, { useEffect, useReducer } from 'react';
import axios from 'axios';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../components/LoadingBox';
import BannerScreen from '../components/BannerScreen';
import MessageBox from '../components/MessageBox';
import Product from '../components/Product';
import Container from 'react-bootstrap/Container';
import Category from '../components/Category';
import 'aos/dist/aos.css';
import Aos from 'aos';




const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, products: action.payload, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default function HomeScreen() {
  const [{ loading, error, products }, dispatch] = useReducer(reducer, {
    products: [],
    loading: true,
    error: '',
  });
  //const [products, setProducts] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        const result = await axios.get('/api/products');
        dispatch({ type: 'FETCH_SUCCESS', payload: result.data });
      } catch (error) {
        dispatch({ type: 'FETCH_FAIL', payload: error.message });
      }
      //setProducts(result.data);
    };
    fetchData();
    Aos.init({duration : 1500});
  }, []);
  return (
    <div>
      <Helmet>
        <title>CarWorld</title>
      </Helmet>

      <BannerScreen></BannerScreen>
      <Container>
        <h1 className='text-center' style={{marginBottom :'20px'}} data-aos="fade-up">CATEGORIES</h1>
        <Category></Category>
        <h1 className='text-center' style={{marginTop :'20px', fontWeight : '300'}} data-aos="fade-up">PRODUCTS</h1>
        <div className="products mt-4">
          {loading ? (
            <LoadingBox />
          ) : error ? (
            <MessageBox variant="danger">{error}</MessageBox>
          ) : (
            <Row>
              {products.map((product) => (
                <Col key={product.slug} sm={6} md={4} lg={3} className="mb-5"  data-aos="fade-up">
                  {/* <Product product={product}></Product> */}
                  <Product product={product}></Product>
                </Col>
              ))}
            </Row>
          )}
        </div>
      </Container>
    </div>
  );
}
