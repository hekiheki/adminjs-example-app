import { Box, DrawerContent, DrawerFooter, Button, Icon } from '@adminjs/design-system';
import React from 'react';
import { useSelector } from 'react-redux';
import {
  ActionProps,
  LayoutElementRenderer,
  BasePropertyComponent,
  ActionHeader,
  useTranslation,
  useRecord,
  flat,
  ReduxState,
} from 'adminjs';

import { ROLE } from '../constants/authUsers.js';
import { ProjectStatus } from '../index.js';

const ShowAction: React.FC<ActionProps> = (props) => {
  const { resource, record: initialRecord, action } = props;
  const properties = resource.showProperties;
  const { translateButton } = useTranslation();
  const { record, handleChange, submit: handleSubmit, loading, setRecord } = useRecord(initialRecord, resource.id);
  const status = flat.get(record?.params, 'status');
  const { roles } = useSelector((state: ReduxState) => state.session) as any;

  return (
    <Box>
      <DrawerContent data-css="drawer-content">
        {action?.showInDrawer ? <ActionHeader {...props} /> : null}
        {action.layout
          ? action.layout.map((layoutElement, i) => (
              <LayoutElementRenderer
                // eslint-disable-next-line react/no-array-index-key
                key={i}
                layoutElement={layoutElement}
                {...props}
                where="show"
              />
            ))
          : properties.map((property) => (
              <BasePropertyComponent
                key={property.propertyPath}
                where="show"
                property={property}
                resource={resource}
                record={record}
              />
            ))}
        {/* {status === ProjectStatus.Pending && roles.includes(ROLE.APPROVER) && (
          <BasePropertyComponent where="edit" property={resource.properties.tags} resource={resource} record={record} />
        )} */}
      </DrawerContent>
      {status === ProjectStatus.Pending && roles.includes(ROLE.APPROVER) && (
        <DrawerFooter data-css="drawer-footer">
          <Button variant="danger" data-css="drawer-cancel" disabled={loading}>
            {loading ? <Icon icon="Loader" spin /> : null}
            {/* {translateButton('reject')} */}
          </Button>
          <Button variant="contained" data-css="drawer-submit" disabled={loading}>
            {loading ? <Icon icon="Loader" spin /> : null}
            {/* {translateButton('approve')} */}
          </Button>
        </DrawerFooter>
      )}
    </Box>
  );
};

export default ShowAction;
