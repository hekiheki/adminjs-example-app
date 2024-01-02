import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  BoxProps,
  H5,
  H2,
  Label,
  Illustration,
  Input,
  FormGroup,
  Button,
  Text,
  MessageBox,
  Link,
} from '@adminjs/design-system';
import { styled } from '@adminjs/design-system/styled-components';
import { ReduxState, useTranslation } from 'adminjs';

const Wrapper = styled(Box)<BoxProps>`
  align-items: center;
  justify-content: center;
  flex-direction: column;
  height: 100%;
`;

const StyledLogo = styled.img`
  max-width: 200px;
  margin: ${({ theme }) => theme.space.md} 0;
`;

const IllustrationsWrapper = styled(Box)<BoxProps>`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  & svg [stroke='#3B3552'] {
    stroke: rgba(255, 255, 255, 0.5);
  }
  & svg [fill='#3040D6'] {
    fill: rgba(255, 255, 255, 1);
  }
`;

export const Login: React.FC = () => {
  const { action, errorMessage: message } = (window as any).__APP_STATE__ as any;
  const { translateComponent, translateMessage } = useTranslation();
  const branding = useSelector((state: ReduxState) => state.branding);

  const query = new URLSearchParams(location.search);
  return (
    <Wrapper flex variant="grey" className="login__Wrapper">
      <Box bg="white" height="440px" flex boxShadow="login" width={[1, 2 / 3, 'auto']}>
        <Box
          bg="primary100"
          color="white"
          p="x3"
          width="380px"
          flexGrow={0}
          display={['none', 'none', 'block']}
          position="relative"
        >
          <H2 fontWeight="lighter">{translateComponent('Login.welcomeHeader')}</H2>
          <Text fontWeight="lighter" mt="default">
            {translateComponent('Login.welcomeMessage')}
          </Text>
          <IllustrationsWrapper p="xxl">
            <Box display="inline" mr="default">
              <Illustration variant="Planet" width={82} height={91} />
            </Box>
            <Box display="inline">
              <Illustration variant="Astronaut" width={82} height={91} />
            </Box>
            <Box display="inline" position="relative" top="-20px">
              <Illustration variant="FlagInCog" width={82} height={91} />
            </Box>
          </IllustrationsWrapper>
        </Box>
        <Box as="form" action={action} method="POST" p="x3" flexGrow={1} width={['100%', '100%', '480px']}>
          <H5 marginBottom="xxl">
            {branding.logo ? <StyledLogo src={branding.logo} alt={branding.companyName} /> : branding.companyName}
          </H5>
          {message && (
            <MessageBox
              my="lg"
              message={message.split(' ').length > 1 ? message : translateMessage(message)}
              variant="danger"
            />
          )}
          <Box mt="xxl">
            <Link href="/auth/login" ml="md">
              {translateComponent('Login.ssoLogin')}
            </Link>
          </Box>

          {/* {query.get('admin') === 'login' && ( */}
          <Box mt="xl">
            <FormGroup>
              <Label required>{translateComponent('Login.properties.username')}</Label>
              <Input name="username" placeholder={translateComponent('Login.properties.username')} />
            </FormGroup>
            <FormGroup>
              <Label required>{translateComponent('Login.properties.password')}</Label>
              <Input
                type="password"
                name="password"
                placeholder={translateComponent('Login.properties.password')}
                autoComplete="new-password"
              />
            </FormGroup>
            <Text mt="xl" textAlign="center">
              <Button variant="contained">{translateComponent('Login.loginButton')}</Button>
            </Text>
          </Box>
          {/* )} */}
        </Box>
      </Box>
    </Wrapper>
  );
};

export default Login;
