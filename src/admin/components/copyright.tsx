import { Text, TextProps } from '@adminjs/design-system';
import { styled } from '@adminjs/design-system/styled-components';
import React from 'react';

const Wrapper = styled(Text)<TextProps>`
  font-family: Roboto, sans-serif;
  line-height: 24px;
  font-weight: 300;
  font-size: 12px;
  text-align: center;
  color: rgb(137, 138, 154);
`;

const Copyright = () => {
  return <Wrapper textAlign="center">© 2014-2024 版权所有</Wrapper>;
};

export default Copyright;
