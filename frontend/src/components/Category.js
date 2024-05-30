import axios from 'axios';
import { LinkContainer } from 'react-router-bootstrap';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import 'aos/dist/aos.css';
import Aos from 'aos';
import {useEffect, useState } from 'react';

export default function Category() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get(`/api/products/categories`);
        setCategories(data);
      } catch (error) {
        // toast.error(getError(error));
      }
    };
    fetchCategories();
    Aos.init({ duration: 1500 })
  }, []);

  return (
    <Row>
      {categories.map((category) => (
        <Col key={category} style={{ backgroundColor: '' }} data-aos="flip-right">
          <LinkContainer
            to={`/search?category=${category}`}
          >
            <div className="category-card">
              <h4>{category}</h4>
            </div>
          </LinkContainer>
        </Col>
      ))}
    </Row>
  );
}
