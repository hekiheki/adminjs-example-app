import { NavBar, BoxProps, Box, Icon } from '@adminjs/design-system';
import { styled } from '@adminjs/design-system/styled-components';
import { ReduxState } from 'adminjs';
import React from 'react';
import { useSelector } from 'react-redux';

import LoggedIn from './loggedIn.js';

const NavBar = styled(Box)<BoxProps>`
  height: ${({ theme }) => theme.sizes.navbarHeight};
  border-bottom: ${({ theme }) => theme.borders.default};
  background: ${({ theme }) => theme.colors.container};
  display: flex;
  flex-direction: row;
  flex-shrink: 0;
  align-items: center;
  justify-content: flex-end;
`;

type Props = {
  toggleSidebar: () => void;
};

const TopBar: React.FC<Props> = (props) => {
  const { toggleSidebar } = props;
  const session = useSelector((state: ReduxState) => state.session);
  const paths = useSelector((state: ReduxState) => state.paths);

  return (
    <NavBar data-css="top-bar">
      <Box
        py="lg"
        px={['default', 'lg']}
        onClick={toggleSidebar}
        display={['block', 'block', 'block', 'block', 'none']}
        style={{ cursor: 'pointer' }}
      >
        <Icon icon="Menu" size={24} />
      </Box>
      {session && (session.nick || session.username) ? <LoggedIn session={session} paths={paths} /> : ''}
    </NavBar>
  );
};

export { TopBar };
export default TopBar;
