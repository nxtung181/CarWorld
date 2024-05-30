import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import FormControl from 'react-bootstrap/FormControl';
import InputGroup from 'react-bootstrap/InputGroup';
import { useNavigate } from 'react-router-dom';

export default function SearchBar() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const submitHandler = (e) => {
    e.preventDefault();
    const encodedQuery = encodeURIComponent(query); // Encode the query string
    navigate(encodedQuery ? `/search?query=${encodedQuery}` : '/search');
  };

  return (
    <Form className="d-flex me-auto" onSubmit={submitHandler}>
      <InputGroup>
        <FormControl
          type="text"
          id="q"
          name="q"
          placeholder="search products..."
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search Products"
          aria-describedby="button-search"
        />
        <Button variant="outline-primary" className='btn-search' type="submit" id="button-search">
          <i className="fas fa-search"></i>
        </Button>
      </InputGroup>
    </Form>
  );
}