import React from 'react';
import { Tabs, Tab } from '@material-ui/core';
import { get } from 'lodash';
import ConceptContainerVersionList from '../common/ConceptContainerVersionList';
import CollectionHomeChildrenList from './CollectionHomeChildrenList';
import AboutAccordian from '../common/AboutAccordian';

const CollectionHomeTabs = props => {
  const {
    tab, onChange, collection, versions, location, versionedObjectURL, currentVersion,
    aboutTab
  } = props;
  const about = get(collection, 'extras.about')

  return (
    <div className='col-md-12 sub-tab'>
      <Tabs className='sub-tab-header' value={tab} onChange={onChange} aria-label="concept-home-tabs"  classes={{indicator: 'hidden'}}>
        <Tab label="Concepts" />
        <Tab label="Mappings" />
        <Tab label="References" />
        <Tab label="Versions" />
        {aboutTab && <Tab label="About" />}
      </Tabs>
      <div className='sub-tab-container' style={{display: 'flex', minHeight: '500px'}}>
        {
          tab === 0 &&
          <CollectionHomeChildrenList
            collection={collection}
            location={location}
            versionedObjectURL={versionedObjectURL}
            versions={versions}
            currentVersion={currentVersion}
            resource='concepts'
          />
        }
        {
          tab === 1 &&
          <CollectionHomeChildrenList
            collection={collection}
            location={location}
            versionedObjectURL={versionedObjectURL}
            versions={versions}
            currentVersion={currentVersion}
            resource='mappings'
          />
        }
        {
          tab === 2 &&
          <CollectionHomeChildrenList
            collection={collection}
            location={location}
            versionedObjectURL={versionedObjectURL}
            versions={versions}
            currentVersion={currentVersion}
            resource='references'
            references
          />
        }
        {
          tab === 3 &&
          <ConceptContainerVersionList versions={versions} resource='collection' />
        }
        {
          aboutTab && tab === 4 &&
          <AboutAccordian id={collection.id} about={about} />
        }
      </div>
    </div>
  );
}

export default CollectionHomeTabs;
