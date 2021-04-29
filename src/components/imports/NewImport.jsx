import React from 'react';
import alertifyjs from 'alertifyjs';
import {
  Tooltip, Button, ButtonGroup, TextField, FormControlLabel, Checkbox
} from '@material-ui/core';
import {
  CloudUpload as UploadIcon,
  Http as URLIcon,
} from '@material-ui/icons';
import { cloneDeep, get } from 'lodash';
import APIService from '../../services/APIService';
import JSONIcon from '../common/JSONIcon';
import FileUploader from '../common/FileUploader';

class NewImport extends React.Component {
  constructor(props) {
    super(props);
    this.defaultState = {
      queue: '',
      parallel: false,
      workers: 1,
      file: null,
      fileURL: '',
      json: '',
      type: 'json',
      update_if_exists: true,
    };
    this.state = cloneDeep(this.defaultState)
  }

  reset = () => this.setState(cloneDeep({...this.defaultState, type: this.state.type}))

  onTypeClick = type => this.setState({type: type})

  getButton = (type, icon, tooltip) => {
    const isSelected = this.state.type === type;
    const variant = isSelected ? 'contained' : 'outlined';
    return (
      <Tooltip title={tooltip}>
        <Button variant={variant} onClick={() => this.onTypeClick(type)}>
          {icon}
        </Button>
      </Tooltip>
    )
  }

  setFieldValue = (id, value) => this.setState({[id]: value})

  onParallelToogle = event => {
    const checked = event.target.checked;
    if(checked) {
      alertifyjs.confirm(
        'Parallel Mode',
        'Bulk Import in parallel mode cannot support hierarchy. Are you sure you want to continue?',
        () => this.setState({parallel: true, queue: ''}),
        () => {}
      )
    } else this.setState({parallel: false})
  }

  canUpload() {
    const { type, fileURL, json, file } = this.state
    if(type === 'upload')
      return Boolean(file)
    if(type === 'url')
      return Boolean(fileURL)
    if(type === 'json')
      return Boolean(json)

    return false
  }

  getPayload() {
    const { type, fileURL, json, file, workers } = this.state
    if(type === 'upload'){
      const formData = new FormData()
      formData.append('file', file)
      formData.append('parallel', workers)
      return formData
    }
    if(type === 'url') {
      const formData = new FormData()
      formData.append('file_url', fileURL)
      formData.append('parallel', workers)
      return formData
    }
    if(type === 'json')
      return json
  }

  getParallelService() {
    return APIService.new().overrideURL('/importers/bulk-import-parallel-inline/')
  }

  getService() {
    const { type, parallel, queue } = this.state
    if(type !== 'json' && parallel)
      return this.getParallelService()

    const service = APIService.new().overrideURL('/importers/bulk-import/')
    if(queue)
      service.appendToUrl(`${queue}/`)
    if(type === 'upload')
      service.appendToUrl('upload/')
    else if(type === 'url')
      service.appendToUrl('file-url/')

    return service
  }

  getHeaders() {
    const { type } = this.state
    if(type !== 'json')
      return {"Content-Type": "multipart/form-data"}

    return {}
  }

  onUpload = () => {
    this.getService().post(this.getPayload(), null, this.getHeaders()).then(res => {
      this.props.onUploadSuccess()
      if(res.status === 202) {
        this.reset()
        alertifyjs.success('Successfully Queued!')
      }
      else
        alertifyjs.error(get(res, 'exception') || 'Failed!')
    })
  }

  render() {
    const { type, queue, parallel, fileURL, json, update_if_exists } = this.state;
    const isUpload = type === 'upload';
    const isURL = type === 'url';
    const isJSON = type === 'json';
    const canUpload = this.canUpload();

    return (
      <React.Fragment>
        <h3 style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <span>
            New Import
          </span>
          <span>
            <ButtonGroup color='secondary' size='small'>
              { this.getButton('json', <JSONIcon />, 'Submit JSON Data') }
              { this.getButton('upload', <UploadIcon />, 'Upload JSON File') }
              { this.getButton('url', <URLIcon />, 'Paste File URL') }
            </ButtonGroup>
          </span>
        </h3>
        <div className='col-md-12 no-side-padding'>
          <div className='col-md-6 no-left-padding'>
            <TextField
              fullWidth
              size='small'
              id='queue'
              variant='outlined'
              placeholder='e.g. my-queue'
              label='Queue'
              value={queue}
              onChange={event => this.setFieldValue('queue', event.target.value)}
              style={{marginBottom: '20px'}}
              disabled={parallel}
            />
          </div>
          <div className='col-md-4 no-side-padding'>
            <FormControlLabel
              control={<Checkbox checked={update_if_exists} onChange={event => this.setFieldValue('update_if_exists', event.target.checked)} name='update_if_exists' />}
              label="Update Existing"
            />
          </div>
          {
            !isJSON &&
            <div className='col-md-2 no-side-padding'>
              <FormControlLabel
                control={<Checkbox checked={parallel} onChange={this.onParallelToogle} name='parallel' />}
                label="Parallel"
              />
            </div>
          }
          {
            isUpload &&
            <div className='col-md-12 no-side-padding' style={{marginBottom: '20px'}}>
              <FileUploader
                uploadButton={false}
                onUpload={uploadedFile => this.setFieldValue('file', uploadedFile)}
                onLoading={() => this.setFieldValue('file', null)}
              />
            </div>
          }
          {
            isURL &&
            <TextField
              fullWidth
              size='small'
              id='fileURL'
              type='url'
              required
              variant='outlined'
              label='JSON File URL'
              value={fileURL}
              onChange={event => this.setFieldValue('fileURL', event.target.value)}
              style={{marginBottom: '20px'}}
            />
          }
          {
            isJSON &&
            <TextField
              multiline
              rows={12}
              fullWidth
              size='small'
              id='json'
              type='url'
              required
              variant='outlined'
              label='JSON Data'
              value={json}
              onChange={event => this.setFieldValue('json', event.target.value)}
              style={{marginBottom: '20px'}}
            />
          }
        </div>
        <div className='col-md-12 no-side-padding' style={{textAlign: 'right'}}>
          <Button
            size='small'
            color='primary'
            variant='outlined'
            startIcon={<UploadIcon fontSize='inherit' />}
            disabled={!canUpload}
            onClick={this.onUpload}
          >
            Upload
          </Button>
        </div>
      </React.Fragment>
    )
  }
}

export default NewImport