import React, {Component} from 'react';
import Button from 'muicss/lib/react/button';

import Work from './Work';
import TextField from './TextField';
import './Group.css';


class Group extends Component {

    render () {
        return (
            <div className="group">
                <div className="group__works">
                    {this.renderWorks()}
                </div>
                <div className="group__description">
                    <TextField allowEdit={this.props.allowEdit}
                               multiline={true}
                               actions={this.descriptionActions()}
                               content={this.props.data.description}/>
                </div>
            </div>
        );
    };

    descriptionActions () {
        return { change: this.props.actions.updateDescription };
    }

    workActions ( work ) {
        return {
            metaChange: ( meta, data )=>this.props.actions.updateWorkMeta( work, meta, data ),
            addMeta: ( type )=>this.props.actions.addWorkMeta( work, type ),
            removeMeta: ( meta )=>this.props.actions.removeWorkMeta( work, meta ),
            getHash: ()=>this.props.actions.getWorkHash( work ),
            setHash: ()=>this.props.actions.setWorkHash( work ),
            clearHash: ()=>this.props.actions.clearHash(),
            allowScroll: this.props.actions.allowScroll
        };
    }

    getWorkClass ( count ) {
        if (count === 1) {
            return 'group__work group__work--single';
        } else {
            return 'group__work group__work--multi';
        }
    }

    renderWorks () {
        return this.props.data.works.map( work => (
            <div key={work.id}
                 className={this.getWorkClass(this.props.data.works.length)}
                 id={this.props.data.id + '-' + work.id}>
                <Work
                    allowEdit={this.props.allowEdit}
                    actions={this.workActions(work)}
                    data={work}/>
                <Button className="group__remove-work-button"
                        variant="raised"
                        onClick={() => this.props.actions.removeWork(work)}
                        onMouseEnter={this.props.actions.highlightParent}
                        onMouseLeave={this.props.actions.unhighlightParent}>
                    - remove object
                </Button>
            </div>
        ) );
    }

}

export default Group;