import { Box, Button, Drawer, DrawerContent, DrawerFooter, H3, Icon } from '@adminjs/design-system';
import React, { useEffect, useRef, useState } from 'react';
import {
  useTranslation,
  useFilterDrawer,
  useQueryParams,
  RecordJSON,
  ResourceJSON,
  BasePropertyComponent,
} from 'adminjs';

export type FilterProps = {
  resource: ResourceJSON;
};

const FilterDrawer: React.FC<FilterProps> = (props) => {
  const { resource } = props;
  const properties = resource.filterProperties;

  const [filter, setFilter] = useState<Record<string, unknown>>({});
  const { translateButton, translateLabel } = useTranslation();
  const initialLoad = useRef(true);
  const { isVisible, toggleFilter } = useFilterDrawer();
  const { storeParams, clearParams, filters } = useQueryParams();

  useEffect(() => {
    if (initialLoad.current) {
      initialLoad.current = false;
    } else {
      setFilter({});
    }
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    // storeParams({ filters: pickBy(filter, (v) => !isNil(v)), page: '1' });
  };

  const handleReset = (event) => {
    event.preventDefault();
    // clearParams('filters');
    setFilter({});
  };

  // useEffect(() => {
  //   if (filters) {
  //     setFilter(filters);
  //   }
  // }, [filters]);

  const handleChange = (propertyName: string | RecordJSON, value: any): void => {
    if ((propertyName as RecordJSON).params) {
      throw new Error('you can not pass RecordJSON to filters');
    }
    setFilter({
      ...filter,
      [propertyName as string]: typeof value === 'string' && !value.length ? undefined : value,
    });
  };

  return (
    <Drawer
      variant="filter"
      isHidden={!isVisible}
      as="form"
      onSubmit={handleSubmit}
      onReset={handleReset}
      data-css={'filter-drawer'}
    >
      <DrawerContent data-css={'filter-drawer-content'}>
        <Box flex justifyContent="space-between">
          <H3>{translateLabel('filters', resource.id)}</H3>
          <Button type="button" variant="light" size="icon" rounded color="text" onClick={toggleFilter}>
            <Icon icon="X" />
          </Button>
        </Box>
        <Box my="x3">
          {properties.map((property) => (
            <BasePropertyComponent
              key={property.propertyPath}
              where="filter"
              onChange={handleChange}
              property={property}
              filter={filter}
              resource={resource}
            />
          ))}
        </Box>
      </DrawerContent>
      <DrawerFooter data-css={'filter-drawer-footer'}>
        <Button type="button" variant="light" onClick={handleReset} data-css={'filter-drawer-button-reset'}>
          {translateButton('resetFilter', resource.id)}
        </Button>
        <Button type="submit" variant="contained" data-css={'filter-drawer-button-apply'}>
          {translateButton('applyChanges', resource.id)}
        </Button>
      </DrawerFooter>
    </Drawer>
  );
};

export { FilterDrawer };

export default FilterDrawer;
