import React from 'react';
import { Link } from 'react-router-dom';
import {
  TableContainer, Table, TableHead, TableBody, TableCell, TableRow,
  Collapse, IconButton, Box, Paper, Tabs, Tab, Checkbox, TableSortLabel, Tooltip,
} from '@material-ui/core';
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  LocalOffer as LocalOfferIcon,
  Link as LinkIcon,
  AccountTreeRounded as TreeIcon,
  Flag as FlagIcon,
  ArrowForward as ForwardIcon,
  Public as PublicIcon,
  List as ListIcon,
  Person as PersonIcon,
  Home as HomeIcon,
  Loyalty as LoyaltyIcon,
} from '@material-ui/icons'
import { Pagination } from '@material-ui/lab'
import {
  map, startCase, get, without, uniq, includes, find, keys, values, isEmpty,
} from 'lodash';
import {
  BLUE, WHITE, DARKGRAY, COLOR_ROW_SELECTED, ORANGE, GREEN, EMPTY_VALUE
} from '../../common/constants';
import {
  formatDate, formatDateTime, headFirst, isLoggedIn
} from '../../common/utils';
import ReferenceChip from '../common/ReferenceChip';
import OwnerChip from '../common/OwnerChip';
import ReleasedChip from '../common/ReleasedChip';
import ToConceptLabel from '../mappings/ToConceptLabel';
import FromConceptLabel from '../mappings/FromConceptLabel';
import AllMappingsTables from '../mappings/AllMappingsTables';
import APIService from '../../services/APIService';
import PinIcon from '../common/PinIcon';

const TAG_ICON_STYLES = {width: '12px', marginRight: '2px', marginTop: '2px'}
const RESOURCE_DEFINITIONS = {
  references: {
    headBgColor: BLUE,
    headTextColor: WHITE,
    columns: [
      {id: 'expression', label: 'Reference', value: 'expression', sortable: false, renderer: reference => <ReferenceChip {...reference} />},
    ],
  },
  concepts: {
    headBgColor: BLUE,
    headTextColor: WHITE,
    columns: [
      {id: 'owner', label: 'Owner', value: 'owner', sortOn: 'owner', renderer: concept => <OwnerChip ownerType={concept.owner_type} owner={concept.owner} />},
      {id: 'parent', label: 'Source', value: 'source', sortOn: 'source'},
      {id: 'id', label: 'ID', value: 'id', sortOn: 'id'},
      {id: 'name', label: 'Name', value: 'display_name', sortOn: 'name', renderer: concept => (concept.retired ? <span className='retired'>{concept.display_name}</span> : <span>{concept.display_name}</span>)},
      {id: 'class', label: 'Class', value: 'concept_class', sortOn: 'concept_class'},
      {id: 'datatype', label: 'Datatype', value: 'datatype', sortOn: 'datatype'},
      {id: 'updatedOn', label: 'UpdatedOn', value: 'version_created_on', formatter: formatDate, sortOn: 'last_update'},
    ],
    tabs: ['Mappings', 'Synonyms', 'Descriptions', 'History',],
    expandible: true,
  },
  mappings: {
    headBgColor: BLUE,
    headTextColor: WHITE,
    columns: [
      {id: 'owner', label: 'Owner', value: 'owner', sortOn: 'owner', renderer: mapping => <OwnerChip ownerType={mapping.owner_type} owner={mapping.owner} />},
      {id: 'parent', label: 'Source', value: 'source', sortOn: 'source'},
      {id: 'id', label: 'ID', value: 'id', sortOn: 'id'},
      {id: 'from', label: 'From Concept', renderer: mapping => <FromConceptLabel {...mapping} noRedirect />},
      {id: 'mapType', label: 'Type', value: 'map_type', sortOn: 'map_type'},
      {id: 'to', label: 'To Concept', renderer: mapping => <ToConceptLabel {...mapping} noRedirect />},
      {id: 'updatedOn', label: 'UpdatedOn', value: 'version_created_on', formatter: formatDate, sortOn: 'last_update'},
    ],
    tabs: ['History',],
    expandible: true,
  },
  sources: {
    headBgColor: GREEN,
    headTextColor: WHITE,
    columns: [
      {id: 'owner', label: 'Owner', value: 'owner', sortOn: 'owner', renderer: source => <OwnerChip ownerType={source.owner_type} owner={source.owner} />},
      {id: 'id', label: 'ID', value: 'short_code', sortOn: 'mnemonic'},
      {id: 'name', label: 'Name', value: 'name', sortOn: 'name'},
      {id: 'sourceType', label: 'Type', value: 'source_type', sortOn: 'source_type'},
    ],
    tags: [
      {id: 'activeConcepts', value: 'active_concepts', label: 'Concepts', icon: <LocalOfferIcon fontSize='small' style={TAG_ICON_STYLES} />, hrefAttr: 'concepts_url'},
      {id: 'activeMappings', value: 'active_mappings', label: 'Mappings', icon: <LinkIcon fontSize='small' style={TAG_ICON_STYLES} />, hrefAttr: 'mappings_url'},
      {id: 'versions', value: 'versions', label: 'Versions', icon: <TreeIcon fontSize='small' style={TAG_ICON_STYLES} />, hrefAttr: 'versions_url'},
    ],
    tabs: ['Versions',],
    expandible: true,
    pinnable: true,
  },
  collections: {
    headBgColor: GREEN,
    headTextColor: WHITE,
    columns: [
      {id: 'owner', label: 'Owner', value: 'owner', sortOn: 'owner', renderer: coll => <OwnerChip ownerType={coll.owner_type} owner={coll.owner} />},
      {id: 'id', label: 'ID', value: 'short_code', sortOn: 'mnemonic'},
      {id: 'name', label: 'Name', value: 'name', sortOn: 'name'},
      {id: 'collectionType', label: 'Type', value: 'collection_type', sortOn: 'collection_type'},
    ],
    tags: [
      {id: 'activeConcepts', value: 'active_concepts', label: 'Concepts', icon: <LocalOfferIcon fontSize='small' style={TAG_ICON_STYLES} />, hrefAttr: 'concepts_url'},
      {id: 'activeMappings', value: 'active_mappings', label: 'Mappings', icon: <LinkIcon fontSize='small' style={TAG_ICON_STYLES} />, hrefAttr: 'mappings_url'},
      {id: 'versions', value: 'versions', label: 'Versions', icon: <TreeIcon fontSize='small' style={TAG_ICON_STYLES} />, hrefAttr: 'versions_url'},
    ],
    tabs: ['Versions',],
    expandible: true,
    pinnable: true,
  },
  organizations: {
    headBgColor: ORANGE,
    headTextColor: WHITE,
    columns: [
      {id: 'id', label: 'ID', value: 'id', sortOn: 'mnemonic', renderer: org => <OwnerChip ownerType='Organization' owner={org.id} />},
      {id: 'name', label: 'Name', value: 'name', sortOn: 'name'},
      {id: 'createdOn', label: 'Created On', value: 'created_on', formatter: formatDate, sortOn: 'created_on'},
    ],
    tags: [
      {id: 'members', value: 'members', label: 'Members', icon: <PersonIcon fontSize='small' style={TAG_ICON_STYLES} />, hrefAttr: 'url'},
      {id: 'sources', value: 'public_sources', label: 'Public Sources', icon: <ListIcon fontSize='small' style={TAG_ICON_STYLES} />, hrefAttr: 'sources_url'},
      {id: 'collections', value: 'public_collections', label: 'Public Collections', icon: <LoyaltyIcon fontSize='small' style={TAG_ICON_STYLES} />, hrefAttr: 'collections_url'},
    ],
    expandible: false,
    pinnable: true,
  },
  users: {
    headBgColor: ORANGE,
    headTextColor: WHITE,
    columns: [
      {id: 'username', label: 'Username', value: 'username', sortOn: 'username', renderer: user => <OwnerChip ownerType='user' owner={user.username} />},
      {id: 'name', label: 'Name', value: 'name', sortOn: 'name'},
      {id: 'createdOn', label: 'Joined On', value: 'created_on', formatter: formatDate, sortOn: 'date_joined'},
    ],
    tags: [
      {id: 'orgs', value: 'orgs', label: 'Organizations', icon: <HomeIcon fontSize='small' style={TAG_ICON_STYLES} />, hrefAttr: 'organizations_url'},
      {id: 'sources', value: 'public_sources', label: 'Public Sources', icon: <ListIcon fontSize='small' style={TAG_ICON_STYLES} />, hrefAttr: 'sources_url'},
      {id: 'collections', value: 'public_collections', label: 'Public Collections', icon: <LoyaltyIcon fontSize='small' style={TAG_ICON_STYLES} />, hrefAttr: 'collections_url'},
    ],
    expandible: false,
  },
}

const getValue = (item, column) => {
  const value = get(item, column.value, '')
  if(get(column, 'formatter') && value)
    return column.formatter(value)
  if(get(column, 'renderer'))
    return column.renderer(item)
  return value
}

const HistoryTable = ({ versions }) => {
  return (
    <Table size="small" aria-label="versions">
      <TableHead>
        <TableRow>
          <TableCell align='center'>Version</TableCell>
          <TableCell align='left'>Comment/Description</TableCell>
          <TableCell align='left'>Created By</TableCell>
          <TableCell align='left'>Created On</TableCell>
          <TableCell />
        </TableRow>
      </TableHead>
      <TableBody>
        {
          map(headFirst(versions), version => (
            <TableRow hover key={version.uuid || version.id}>
              <TableCell align='center'>
                { version.uuid || version.id }
              </TableCell>
              <TableCell align='left'>
                { version.update_comment || version.description }
              </TableCell>
              <TableCell align='left'>
                { version.version_created_by }
              </TableCell>
              <TableCell align='left'>
                { formatDateTime(version.version_created_on || version.created_at) }
              </TableCell>
              {
                version.released ?
                <TableCell align='center'><ReleasedChip /></TableCell> :
                <TableCell />
              }
            </TableRow>
          ))
        }
      </TableBody>
    </Table>
  );
}

const LocalesTable = ({ locales, isDescription }) => {
  const nameAttr = isDescription ? 'description' : 'name';
  const typeAttr = isDescription ? 'description_type' : 'name_type';
  return (
    <Table size="small" aria-label="locales">
      <TableHead>
        <TableRow>
          <TableCell align='right'>ID</TableCell>
          <TableCell align='left'>Type</TableCell>
          <TableCell align='left'>{startCase(nameAttr)}</TableCell>
          <TableCell align='left'>External ID</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {
          isEmpty(locales) ?
          <TableRow colSpan='5'>
            <TableCell colSpan='6' align='center'>No Records</TableCell>
          </TableRow> :
          map(locales, locale => (
            <TableRow hover key={locale.uuid}>
              <TableCell align='right' style={{width: '100px'}}>
                <span className='flex-vertical-center'>
                  {
                    locale.locale_preferred &&
                    <span style={{marginRight: '5px'}}>
                      <Tooltip title={`Preferred ${nameAttr} for this locale`} placement='top-start'>
                        <FlagIcon color='secondary' fontSize='small' style={{width: '18px', marginTop: '4px'}}/>
                      </Tooltip>
                    </span>
                  }
                  {
                    locale.external_id &&
                    <span style={{marginRight: '5px'}}>
                      <Tooltip title={`External ID: ${locale.external_id}`} placement='top-start'>
                        <ForwardIcon
                          fontSize='small'
                          color='secondary'
                          style={{
                            border: '1px solid', borderRadius: '10px',
                            background: 'gray', color: 'white',
                            width: '18px',
                            height: '18px',
                            marginTop: '4px'
                          }}
                        />
                      </Tooltip>
                    </span>
                  }
                  <span> { locale.uuid } </span>
                </span>
              </TableCell>
              <TableCell align='left'>{ startCase(get(locale, typeAttr)) || EMPTY_VALUE }</TableCell>
              <TableCell align='left' className='ellipsis-text'>
                <span className='gray-italics-small'>{`[${locale.locale}]`}</span>
                <span>{ get(locale, nameAttr) }</span>
              </TableCell>
              <TableCell align='left'>{ locale.external_id || EMPTY_VALUE }</TableCell>
            </TableRow>
          ))
        }
      </TableBody>
    </Table>
  );
}

const ExpandibleRow = props => {
  const {
    item, resourceDefinition, resource, isSelected, isSelectable, onPinCreate, onPinDelete, pins,
    nested
  } = props;
  const [mappings, setMappings] = React.useState([]);
  const [versions, setVersions] = React.useState([]);
  const [names, setNames] = React.useState([]);
  const [descriptions, setDescriptions] = React.useState([]);
  const [open, setOpen] = React.useState(false);
  const [pinned, setPin] = React.useState(() => includes(map(pins, 'resource_uri'), item.url));
  const [tab, setTab] = React.useState(0);
  const [selected, setSelected] = React.useState(isSelected);
  const isConceptContainer = includes(['sources', 'collections'], resource);
  const isPublic = includes(['view', 'edit'], get(item, 'public_access', '').toLowerCase()) && isConceptContainer;
  const shouldShowPin = isLoggedIn() && resourceDefinition.pinnable;
  const pinId = get(find(pins, {resource_uri: item.url}), 'id');

  const columnsCount = get(resourceDefinition, 'columns.length', 1) +
                        (isConceptContainer ? 1 : 0) + //public column
                           (isSelectable ? 1 : 0) + // select column
                            ((resourceDefinition.expandible || shouldShowPin) ? 1 : 0) + // expand icon column
                          (resourceDefinition.tags ? 1 : 0); //tags column

  React.useEffect(() => {
    setPin(includes(map(pins, 'resource_uri'), item.url))
  }, [pins]);

  const onClick = event => {
    if(!resourceDefinition.expandible)
      return;

    event.stopPropagation()
    event.preventDefault()

    setOpen(prevOpen => {
      const newOpen = !prevOpen
      if(newOpen) {
        fetchVersions();
        if(resource === 'concepts') {
          fetchNames();
          fetchDescriptions();
          fetchMappings();
        }
      }
      return newOpen
    })
  }

  const onPinClick = event => {
    if(!shouldShowPin)
      return;

    event.stopPropagation()
    event.preventDefault()

    const newPinState = !pinned;
    if(newPinState)
      onPinCreate(item.type, item.uuid)
    else
      onPinDelete(pinId)

    return false;
  }

  const onRowClick = event => {
    if(resource === 'references')
      return
    event.stopPropagation();
    event.preventDefault()
    window.open('#' + item.url, '_blank')
  }

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const fetchVersions = () => {
    if(item.url) {
      APIService.new().overrideURL(item.url)
                .appendToUrl('versions/')
                .get()
                .then(response => {
                  if(response.status === 200)
                    setVersions(response.data)
                })
    }
  }
  const fetchNames = () => {
    if(item) {
      APIService.new().overrideURL(item.url)
                .appendToUrl('names/')
                .get()
                .then(response => {
                  if(response.status === 200)
                    setNames(response.data)
                })
    }
  }

  const fetchDescriptions = () => {
    if(item) {
      APIService.new().overrideURL(item.url)
                .appendToUrl('descriptions/')
                .get()
                .then(response => {
                  if(response.status === 200)
                    setDescriptions(response.data)
                })
    }
  }

  const fetchMappings = () => {
    if(item) {
      APIService.new().overrideURL(item.url)
                .appendToUrl('mappings/')
                .get(null, null, {includeInverseMappings: true})
                .then(response => {
                  if(response.status === 200)
                    setMappings(response.data)
                })
    }
  }

  const onCheckboxClick = event => {
    setSelected(prevSelected => {
      const newValue = !prevSelected;
      props.onSelectChange(item.id, newValue)
      return newValue;
    })
    event.stopPropagation();
    event.preventDefault();
  }

  const getTab = label => {
    return (
      <Tab key={label} label={label} style={{fontSize: '12px', fontWeight: 'bold'}} />
    )
  }

  const navigateTo = (event, url) => {
    let _url = url;

    if(!isConceptContainer)
      _url = url.replace('/versions', '/history')

    event.stopPropagation()
    event.preventDefault()
    window.open('#' + _url, '_blank')
  }

  return (
    <React.Fragment>
      <TableRow
        hover
        style={selected ? {backgroundColor: COLOR_ROW_SELECTED, cursor: 'pointer'} : {cursor: 'pointer'}}
        onClick={onRowClick}>
        {
          isPublic &&
          <TableCell align='center'>
            <Tooltip title='Public'>
              <span className='flex-vertical-center'>
                <PublicIcon fontSize='small' />
              </span>
            </Tooltip>
          </TableCell>
        }
        {
          isSelectable &&
          <TableCell>
            <Checkbox checked={selected} onClick={onCheckboxClick} />
          </TableCell>
        }
        {
          map(resourceDefinition.columns, column => (
            <TableCell key={column.id} align={column.align || 'left'}>
              { getValue(item, column) || 'None' }
            </TableCell>
          ))
        }
        {
          !isSelectable &&
          <TableCell align='left' style={{width: '120px', padding: '2px'}}>
            {
              map(resourceDefinition.tags, tag => (
                <Link key={tag.id} to='' onClick={event => navigateTo(event, get(item, tag.hrefAttr))}>
                  <Tooltip title={tag.label}>
                    <div style={{fontSize: '14px', lineHeight: '0px', marginBottom: '2px'}}>
                      <div className='flex-vertical-center'>
                        <span>{tag.icon}</span>
                        <span style={{padding: '2px'}}>{`${get(item, tag.value, '0').toLocaleString()}`}</span>
                      </div>
                    </div>
                  </Tooltip>
                </Link>
              ))
            }
          </TableCell>
        }
        {
          (resourceDefinition.expandible || shouldShowPin) &&
          <TableCell align={nested ? 'center' : 'left'}>
            {
              resourceDefinition.expandible &&
              <IconButton aria-label="expand row" size="small" onClick={onClick}>
                {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              </IconButton>
            }
            {
              shouldShowPin &&
              <IconButton aria-label="expand row" size="small" onClick={onPinClick}>
                {<PinIcon fontSize="small" pinned={pinned ? pinned.toString() : undefined} />}
              </IconButton>
            }
          </TableCell>
        }
      </TableRow>
      {
        resourceDefinition.expandible &&
        <TableRow>
          <TableCell style={{ padding: 0 }} colSpan={columnsCount}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box margin={1}>
                <Paper square style={{boxShadow: 'none', border: '1px solid lightgray'}}>
                  <Tabs
                    value={tab}
                    indicatorColor="primary"
                    textColor="primary"
                    onChange={handleTabChange}
                  >
                    {
                      map(resourceDefinition.tabs, label => getTab(label))
                    }
                  </Tabs>
                  {
                    tab === resourceDefinition.tabs.indexOf('Mappings') &&
                    <div style={{borderTop: '1px solid lightgray', maxHeight: '175px', overflow: 'auto'}}>
                      <AllMappingsTables mappings={mappings} concept={item.id}/>
                    </div>
                  }
                  {
                    tab === resourceDefinition.tabs.indexOf('Synonyms') &&
                    <div style={{borderTop: '1px solid lightgray', maxHeight: '175px', overflow: 'auto'}}>
                      <LocalesTable locales={names} />
                    </div>
                  }
                  {
                    tab === resourceDefinition.tabs.indexOf('Descriptions') &&
                    <div style={{borderTop: '1px solid lightgray', maxHeight: '175px', overflow: 'auto'}}>
                      <LocalesTable locales={descriptions} isDescription={true} />
                    </div>
                  }
                  {
                    (
                      tab === resourceDefinition.tabs.indexOf('History') ||
                      tab === resourceDefinition.tabs.indexOf('Versions')
                    ) &&
                    <div style={{borderTop: '1px solid lightgray', maxHeight: '175px', overflow: 'auto'}}>
                      <HistoryTable versions={versions} />
                    </div>
                  }
                </Paper>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      }
    </React.Fragment>
  )
}

const ResultsTable = (
  {
    resource, results, onPageChange, onSortChange, sortParams,
    onPinCreate, onPinDelete, pins, nested
  }
) => {
  const resourceDefinition = RESOURCE_DEFINITIONS[resource];
  const theadBgColor = get(resourceDefinition, 'headBgColor', BLUE);
  const theadTextColor = get(resourceDefinition, 'headTextColor', WHITE);
  const theadStyles = {
    backgroundColor: theadBgColor,
    border: `1px solid ${theadBgColor}`,
  }
  const isConceptContainer = includes(['sources', 'collections'], resource);
  const shouldShowPin = isLoggedIn() && resourceDefinition.pinnable;
  const columnsCount = get(resourceDefinition, 'columns.length', 1) + ((resourceDefinition.expandible || shouldShowPin) ? 2 : 1) + (isConceptContainer ? 1 : 0);
  const canRender = results.total && resourceDefinition;
  const defaultOrderBy = get(find(resourceDefinition.columns, {sortOn: get(values(sortParams), '0', 'last_update')}), 'id', 'UpdateOn');
  const defaultOrder = get(keys(sortParams), '0') === 'sortAsc' ? 'asc' : 'desc';
  const [selectedList, setSelectedList] = React.useState([]);
  const [orderBy, setOrderBy] = React.useState(defaultOrderBy)
  const [order, setOrder] = React.useState(defaultOrder)
  const isSelectable = includes(['concepts', 'mappings'], resource);

  const onAllSelect = event => {
    if(event.target.checked)
      setSelectedList(map(results.items, 'id'))
    else
      setSelectedList([])
  }

  const updateSelected = (id, selected) => {
    if(selected)
      setSelectedList(uniq([...selectedList, id]))
    else
      setSelectedList(without(selectedList, id))
  }

  const getOppositeOrder = order => {
    return order === 'asc' ? 'desc' : 'asc';
  }

  const onSort = (event, columnId) => {
    let newOrder = 'desc';
    if(orderBy === columnId)
      newOrder = getOppositeOrder(order)

    const sortOn = get(find(resourceDefinition.columns, {id: columnId}), 'sortOn', 'last_update')
    let sortQuery = {sortDesc: sortOn}
    if(newOrder === 'asc')
      sortQuery = {sortAsc: sortOn}

    setOrder(newOrder)
    setOrderBy(columnId)
    onSortChange(sortQuery)
  }

  return (
    <div className='col-sm-12 no-side-padding'>
      {
        canRender ?
        <div className='col-sm-12 no-side-padding search-results'>
          <TableContainer style={{borderRadius: '4px'}}>
            <Table size='small'>
              <TableHead style={theadStyles}>
                {
                  selectedList.length > 0 &&
                  <TableRow colSpan={columnsCount} style={{backgroundColor: DARKGRAY, border: `1px solid ${DARKGRAY}`}}>
                    <TableCell colSpan={columnsCount} align='left' style={{color: WHITE}}>
                      {selectedList.length} Selected
                    </TableCell>
                  </TableRow>
                }
                <TableRow>
                  {
                    isConceptContainer &&
                    <TableCell />
                  }
                  {
                    isSelectable &&
                    <TableCell>
                      <Checkbox style={{color: theadTextColor}} onChange={onAllSelect} />
                    </TableCell>
                  }
                  {
                    map(resourceDefinition.columns, column => {
                      const isSortable = column.sortable !== false;
                      return isSortable ? (
                        <TableCell
                          key={column.id}
                          sortDirection={orderBy === column.id ? order : false}
                          align={column.align || 'left'}
                          style={{color: theadTextColor}}>
                          <TableSortLabel
                            className='table-sort-label-white'
                            active={orderBy === column.id}
                            direction={orderBy === column.id ? order : 'desc'}
                            onClick={(event) => onSort(event, column.id)}
                            style={{color: theadTextColor}}
                          >
                            { column.label }
                          </TableSortLabel>
                        </TableCell>
                      ) : (
                        <TableCell key={column.id} align='left' style={{color: theadTextColor}}>
                          {column.label}
                        </TableCell>
                      )
                    })
                  }
                  {
                    !isSelectable &&
                    <TableCell />
                  }
                  {
                    (resourceDefinition.expandible || shouldShowPin) &&
                    <TableCell />
                  }
                </TableRow>
              </TableHead>
              <TableBody>
                {
                  map(results.items, item => (
                    <ExpandibleRow
                      key={item.uuid || item.id}
                      item={item}
                      resource={resource}
                      resourceDefinition={resourceDefinition}
                      isSelected={includes(selectedList, item.id)}
                      onSelectChange={updateSelected}
                      isSelectable={isSelectable}
                      onPinCreate={onPinCreate}
                      onPinDelete={onPinDelete}
                      pins={pins}
                      nested={nested}
                    />
                  ))
                }
                <TableRow colSpan={columnsCount}>
                  <TableCell colSpan={columnsCount} align='center' className='pagination-center'>
                    <Pagination
                      onChange={(event, page) => onPageChange(page)}
                      count={results.pages}
                      variant="outlined"
                      shape="rounded"
                      color="primary"
                      showFirstButton
                      showLastButton
                      page={results.pageNumber}
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </div> :
        <div style={{padding: '2px'}}>We found 0 {startCase(resource)}.</div>
      }
    </div>
  )
}

export default ResultsTable
