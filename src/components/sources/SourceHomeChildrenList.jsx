import React from 'react';
import Search from '../search/Search';
import VersionFilter from '../common/VersionFilter';
import { map } from 'lodash';

class SourceHomeChildrenList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedVersion: this.props.currentVersion || 'HEAD'
    }
  }

  getURL() {
    const { selectedVersion } = this.state;
    const { versionedObjectURL, resource } = this.props;
    let url = versionedObjectURL;
    if(selectedVersion && selectedVersion !== 'HEAD')
      url += `${selectedVersion}/`
    url += `${resource}/`

    return url
  }

  onChange = version => {
    this.setState({selectedVersion: version || 'HEAD'})
  }

  getExtraControls() {
    const { selectedVersion } = this.state;
    const { versions } = this.props;
    return (
      <VersionFilter
        size='small'
        onChange={this.onChange}
        versions={map(versions, 'id')}
        selected={selectedVersion}
      />
    )
  }

  render() {
    return (
      <Search
        {...this.props}
        nested={true}
        baseURL={this.getURL()}
        fixedFilters={{isTable: true, limit: 25}}
        extraControls={this.getExtraControls()}
      />
    )
  }
}

export default SourceHomeChildrenList;