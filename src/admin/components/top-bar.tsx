import { Wrapper, Box, Avatar, Text, Icon, Link } from '@adminjs/design-system';
import { ReduxState } from 'adminjs';
import React, { FC } from 'react';
import { useSelector } from 'react-redux';

const TopBar: FC = () => {
  const session = useSelector((state: ReduxState) => state.session);
  const { username, nick, avatarUrl } = session;

  if (!session) return null;

  return (
    <Box flex flexGrow={1} justifyContent="end" alignItems="center">
      <Box ml="xl" mr="auto" flex alignItems="center">
        <Avatar src={avatarUrl} alt={nick || username} mr="lg">
          <Icon icon="User" />
        </Avatar>
        <Text>{nick || username}</Text>
      </Box>
      <Link href="/logout" mr="lg">
        <Icon icon="LogOut" />
      </Link>
    </Box>
  );
};

export { TopBar };
export default TopBar;
