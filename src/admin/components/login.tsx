import React from 'react';
import { useSelector } from 'react-redux';
import { Box, BoxProps, H4, Label, Input, FormGroup, Button, Text, MessageBox, Link } from '@adminjs/design-system';
import { styled } from '@adminjs/design-system/styled-components';
import { ReduxState, useTranslation } from 'adminjs';

import Copyright from './copyright.js';

const Wrapper = styled(Box)<BoxProps>`
  align-items: center;
  justify-content: center;
  flex-direction: column;
  height: 100%;
`;

const StyledLogo = styled.img`
  max-width: 200px;
`;

export const Login: React.FC = () => {
  const { action, errorMessage: message } = (window as any).__APP_STATE__ as any;
  const { translateComponent, translateMessage } = useTranslation();
  const branding = useSelector((state: ReduxState) => state.branding);

  return (
    <Wrapper flex variant="grey" className="login__Wrapper">
      <Box bg="white" flex boxShadow="login" width={[1, 2 / 3, 'auto']}>
        <Box as="form" action={action} method="POST" p="x3" flexGrow={1} width={['100%', '100%', '480px']}>
          <H4 marginBottom="xxl" flex alignItems="center">
            {branding.logo ? <StyledLogo src={branding.logo} alt={branding.companyName} /> : branding.companyName}
          </H4>

          {message && (
            <MessageBox
              my="lg"
              message={message.split(' ').length > 1 ? message : translateMessage(message)}
              variant="danger"
            />
          )}

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
            <Text mt="xl" textAlign="center">
              <Link href="/auth/login">
                <StyledLogo src="/ding-ding.svg" alt={translateComponent('Login.ssoLogin')} />
              </Link>
            </Text>
          </Box>
        </Box>
      </Box>
      <Box mt="xxl">
        <Copyright />
      </Box>
    </Wrapper>
  );
};

export default Login;
