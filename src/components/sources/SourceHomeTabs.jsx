import React from 'react';
import { Tabs, Tab } from '@material-ui/core';
import VersionList from '../common/VersionList';
import SourceHomeDetails from './SourceHomeDetails';
import SourceHomeChildrenList from './SourceHomeChildrenList';

const SourceHomeTabs = props => {
  const {
    tab, onChange, source, versions, location, versionedObjectURL, currentVersion,
  } = props;
  return (
    <div className='col-md-12 sub-tab'>
      <Tabs className='sub-tab-header' value={tab} onChange={onChange} aria-label="concept-home-tabs" indicatorColor='none'>
        <Tab label="Details" />
        <Tab label="Concepts" />
        <Tab label="Mappings" />
        <Tab label="History" />
        <Tab label="About" />
      </Tabs>
      <div className='sub-tab-container' style={{display: 'flex', minHeight: '500px'}}>
        {
          tab === 0 &&
          <SourceHomeDetails source={source} />
        }
        {
          tab === 1 &&
          <SourceHomeChildrenList
            source={source}
            location={location}
            versionedObjectURL={versionedObjectURL}
            versions={versions}
            currentVersion={currentVersion}
            resource='concepts'
          />
        }
        {
          tab === 2 &&
          <SourceHomeChildrenList
            source={source}
            location={location}
            versionedObjectURL={versionedObjectURL}
            versions={versions}
            currentVersion={currentVersion}
            resource='mappings'
          />
        }
        {
          tab === 3 &&
          <VersionList versions={versions} resource='mapping' />
        }
        {
          tab === 4 &&
          <span>About</span>
        }
      </div>
    </div>
  );
}

export default SourceHomeTabs;