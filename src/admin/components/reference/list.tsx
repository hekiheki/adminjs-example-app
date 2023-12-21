import React from 'react';
import { ShowPropertyProps } from 'adminjs';
import ReferenceValue from './reference-value.js';

const List: React.FC<ShowPropertyProps> = (props) => <ReferenceValue {...props} />;

export default List;
