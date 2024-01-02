import { Box, Button, DrawerContent, DrawerFooter, Icon } from '@adminjs/design-system';
import React, { FC, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useRecord, useTranslation, RecordJSON, ActionProps, BasePropertyComponent, ActionHeader } from 'adminjs';

// import { ProjectStatus } from '../index.js';

const ApproveAction: FC<ActionProps> = (props) => {
  const { record: initialRecord, resource, action } = props;

  const { record, handleChange, submit: handleSubmit, loading, setRecord } = useRecord(initialRecord, resource.id);
  const { translateButton } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    if (initialRecord) {
      setRecord(initialRecord);
    }
  }, [initialRecord]);

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleSubmit({
      ...record.params,
      status: 'Approved',
    }).then((response) => {
      if (response.data.redirectUrl) {
        navigate(response.data.redirectUrl);
      }
    });
    return false;
  };

  const reject = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleSubmit({
      ...record.params,
      status: 'Rejected',
    }).then((response) => {
      if (response.data.redirectUrl) {
        navigate(response.data.redirectUrl);
      }
    });
    return false;
  };

  return (
    <Box as="form" onSubmit={submit} flex flexDirection="column" data-css="form">
      <DrawerContent data-css="drawer-content">
        {action?.showInDrawer ? <ActionHeader {...props} /> : null}
        {resource.showProperties.map((property) => (
          <BasePropertyComponent
            key={property.propertyPath}
            where="show"
            onChange={handleChange}
            property={property}
            resource={resource}
            record={record as RecordJSON}
          />
        ))}
        <BasePropertyComponent
          key="tags"
          where="edit"
          onChange={handleChange}
          property={resource.properties.tags}
          resource={resource}
          record={record as RecordJSON}
        />
      </DrawerContent>
      <DrawerFooter data-css="drawer-footer">
        <Button
          variant="danger"
          type="button"
          data-css="drawer-cancel"
          data-testid="button-cancel"
          disabled={loading}
          onClick={reject}
        >
          {loading ? <Icon icon="Loader" spin /> : null}
          {translateButton('reject', resource.id)}
        </Button>
        <Button variant="contained" type="submit" data-css="drawer-submit" data-testid="button-save" disabled={loading}>
          {loading ? <Icon icon="Loader" spin /> : null}
          {translateButton('approve', resource.id)}
        </Button>
      </DrawerFooter>
    </Box>
  );
};

export default ApproveAction;
