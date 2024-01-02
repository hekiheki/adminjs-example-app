import { Box, Button, DrawerContent, DrawerFooter, Icon } from '@adminjs/design-system';
import React, { FC, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  useRecord,
  useTranslation,
  RecordJSON,
  LayoutElementRenderer,
  ActionProps,
  BasePropertyComponent,
  ActionHeader,
} from 'adminjs';

const EditAction: FC<ActionProps> = (props) => {
  const { record: initialRecord, resource, action } = props;

  const { record, handleChange, submit: handleSubmit, loading, setRecord } = useRecord(initialRecord, resource.id);
  const { translateButton } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    if (initialRecord) {
      setRecord(initialRecord);
    }
  }, [initialRecord]);

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

    return passwordRegex.test(password);
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { newPassword, confirmPassword, ...rest } = record.params || {};
    const errors: any = {};
    if (!validatePassword(newPassword)) {
      errors.newPassword = {
        message:
          '密码必须满足以下条件：至少8个字符长，包含至少一个大写字母、一个小写字母、一个数字和一个特殊字符（!@#$%^&*）',
      };
    }
    if (newPassword !== confirmPassword) {
      errors.confirmPassword = {
        message: '两次输入密码不一致, 请重新输入',
      };
    }

    if (Object.keys(errors).length) {
      setRecord({
        ...record,
        errors,
      });
    } else {
      console.log(rest);
      // handleSubmit({
      //   ...rest,
      //   password: await argon2.hash(newPassword),
      // }).then((response) => {
      //   if (response.data.redirectUrl) {
      //     navigate(response.data.redirectUrl);
      //   }
      // });
    }
    return false;
  };

  const contentTag = 'drawer-content';
  const formTag = 'form';
  const footerTag = 'drawer-footer';
  const buttonTag = 'drawer-submit';

  return (
    <Box as="form" onSubmit={submit} flex flexDirection="column" data-css={formTag}>
      <DrawerContent data-css={contentTag}>
        {action?.showInDrawer ? <ActionHeader {...props} /> : null}
        {action.layout
          ? action.layout.map((layoutElement, i) => (
              <LayoutElementRenderer
                // eslint-disable-next-line react/no-array-index-key
                key={i}
                layoutElement={layoutElement}
                {...props}
                where="edit"
                onChange={handleChange}
                record={record as RecordJSON}
              />
            ))
          : resource.editProperties.map((property) => (
              <BasePropertyComponent
                key={property.propertyPath}
                where="edit"
                onChange={handleChange}
                property={property}
                resource={resource}
                record={record as RecordJSON}
              />
            ))}
      </DrawerContent>
      <DrawerFooter data-css={footerTag}>
        <Button variant="contained" type="submit" data-css={buttonTag} data-testid="button-save" disabled={loading}>
          {loading ? <Icon icon="Loader" spin /> : null}
          {translateButton('save', resource.id)}
        </Button>
      </DrawerFooter>
    </Box>
  );
};

export default EditAction;
