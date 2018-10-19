import React, { Component } from 'react';
import Button from 'muicss/lib/react/button';
import Container from 'muicss/lib/react/container';

import './Gallery.css';
import '../node_modules/muicss/dist/css/mui.min.css'
import Group from './Group';
import ImageBrowser from './ImageBrowser';
import TextField from './TextField';


class Gallery extends Component {

    constructor( props ) {
        super( props );
        this.state = this.props.data;
        this.imageBrowser = React.createRef();
        this.addGroup = this.addGroup.bind( this );
    }

    render() {
        return (
            <div className="gallery">
                <Container>
                    <h1>
                        <TextField
                            allowEdit={this.props.allowEdit}
                            id="Exhibition title"
                            multiline={true}
                            actions={this.titleActions()}
                            content={this.state.name}/>
                    </h1>
                    {this.renderGroups()}
                    <br/>
                    <Button color="accent"
                            onClick={this.addGroup}>
                        + add a set
                    </Button>
                </Container>
                <ImageBrowser ref={this.imageBrowser} actions={this.imageBrowserActions()}/>
            </div>
        );
    };

    showImageBrowser() {
        return this.imageBrowser.current.show()
    }

    hideImageBrowser() {
        this.imageBrowser.current.hide();
    }

    imageBrowserActions() {
        return {
            loadObjects: this.props.actions.loadObjects,
            allowScroll: this.props.actions.allowScroll
        };
    }

    titleActions() {
        return {
            change: text => this.setState( { name: text } )
        };
    }

    groupActions( group ) {
        return {
            addWork: () => this.addWork( group ),
            removeWork: ( work ) => this.removeWork( group, work ),
            updateDescription: ( content ) => this.updateGroupDescription( group, content ),
            addWorkMeta: ( work, type ) => this.addWorkMeta( group, work, type ),
            removeWorkMeta: ( work, meta ) => this.removeWorkMeta( group, work, meta ),
            updateWorkMeta: ( work, meta, data ) => this.updateWorkMeta( group, work, meta, data ),
            getWorkHash: ( work ) => this.getWorkHash( group, work ),
            setWorkHash: ( work ) => this.props.actions.setHash( this.getWorkHash( group, work ) ),
            clearHash: () => this.props.actions.clearHash(),
            highlightParent: this.highlightParent,
            unhighlightParent: this.unhighlightParent,
            allowScroll: this.props.actions.allowScroll
        };
    }

    renderGroups() {
        return this.state.groups.map( group => (
            <div key={group.id} className="gallery__group">
                <Group allowEdit={this.props.allowEdit}
                       data={group}
                       actions={this.groupActions(group)}
                       config={this.state.config}/>
                <Button variant="raised"
                        onClick={()=>this.addWork(group)}
                        disabled={group.works.length >= this.state.config.maxGroupSize}
                        onMouseEnter={this.highlightParent}
                        onMouseLeave={this.unhighlightParent}
                >
                    + add an Object
                </Button>
                <Button variant="raised" className="gallery__remove-group-button"
                        onClick={() => this.removeGroup(group)}
                        onMouseEnter={this.highlightParent}
                        onMouseLeave={this.unhighlightParent}
                >
                    - remove set
                </Button>
            </div>
        ) );
    }

    highlightParent( e ) {
        e.target.parentNode.classList.add( 'highlight' )
    }

    unhighlightParent( e ) {
        e.target.parentNode.classList.remove( 'highlight' )
    }

    addGroup() {
        let newGroup = {
            id: this.state.newGroupId,
            description: this.state.config.group.descriptionPrompt,
            newWorkId: 0,
            works: []
        };

        this.setState( { newGroupId: this.state.newGroupId + 1, groups: [ ...this.state.groups, newGroup ] } );
    }

    removeGroup( group ) {
        let groups = this.state.groups.filter( g => g !== group );
        this.setState( { groups: groups } );
    }

    updateGroupDescription( group, content ) {
        //console.log( content );
        var groups = this.state.groups.slice();
        for ( let g of groups ) {
            if ( g === group ) {
                g.description = content;
            }
        }
        this.setState( { groups: groups } );
    }

    addWork( group ) {
        this.showImageBrowser()
            .then( ( object )=> {
                var groups = this.state.groups.slice();
                for ( let g of groups ) {
                    if ( g === group ) {
                        let newWork = {
                            id: group.newWorkId++,
                            assetData: object,
                            newMetaId: 0,
                            metaData: []
                        };
                        g.works.push( newWork );
                    }
                }
                this.setState( { groups: groups } );
            }, ( e )=> {
            } );
    }

    removeWork( group, work ) {
        var groups = this.state.groups.slice();
        for ( let g of groups ) {
            if ( g === group ) {
                g.works = g.works.filter( w => w !== work );
            }
        }
        this.setState( { groups: groups } );
    }

    updateWorkMeta( group, work, meta, data ) {
        var groups = this.state.groups.slice();
        for ( let g of groups ) {
            if ( g === group ) {
                for ( let w of g.works ) {
                    if ( w === work ) {
                        for ( let m of w.metaData ) {
                            if ( m === meta ) {
                                meta.data = data;
                            }
                        }
                    }
                }
            }
        }
        this.setState( { groups: groups } );
    }

    removeWorkMeta( group, work, meta ) {
        var groups = this.state.groups.slice();
        for ( let g of groups ) {
            if ( g === group ) {
                for ( let w of g.works ) {
                    if ( w === work ) {
                        w.metaData = w.metaData.filter( m => m != meta );
                    }
                }
            }
        }
        this.setState( { groups: groups } );
    }

    addWorkMeta( group, work, type ) {
        var groups = this.state.groups.slice();
        for ( let g of groups ) {
            if ( g === group ) {
                for ( let w of g.works ) {
                    if ( w === work ) {
                        let newMeta = JSON.parse( JSON.stringify( this.state.config.metaTypes[ type ] ) );
                        newMeta.id = ++work.newMetaId;
                        work.metaData.push( newMeta )
                    }
                }
            }
        }
        this.setState( { groups: groups } );
    }

    getWorkHash( group, work ) {
        return `${group.id}:${work.id}`;
    }

}

export default Gallery;