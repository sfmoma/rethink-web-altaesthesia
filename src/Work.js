import React, {Component} from 'react';
import Button from 'muicss/lib/react/button';

import './Work.css';
import TextField from './TextField';
import LinkField from './LinkField';


class Work extends Component {

    constructor ( props ) {
        super( props );
        this.element = React.createRef();
        this.placeholder = React.createRef();
        this.detailView = false;
        this.elementModalStyle = {};
        this.placeHolderModalStyle = {};
        this.toggleDetailView = this.toggleDetailView.bind( this );
        this.imageTitle = this.imageTitle.bind( this );
    }

    componentDidMount () {
        window.addEventListener( 'hashchange', ( e )=> {
            let activeHash = window.location.hash.slice( 1 );
            let workHash = this.props.actions.getHash();
            if (activeHash == workHash) {
                if (!this.detailView) {
                    this.toggleDetailView();
                }
            } else {
                if (this.detailView) {
                    this.toggleDetailView();
                }
            }
        } );
    }

    updateHash () {
        if (this.detailView) {
            this.props.actions.setHash();
        } else {
            this.props.actions.clearHash();
        }
    }

    toggleDetailView () {
        this.detailView = !this.detailView;
        if (this.detailView) {

            //get bounding box of work in list
            let box = this.element.current.getBoundingClientRect();

            //change to fixed position but keep apparent location
            this.elementModalStyle = {
                top: box.top + 'px',
                left: box.left + 'px',
                height: box.height + 'px',
                width: box.width + 'px',
                position: 'fixed'
            };
            Object.assign( this.element.current.style, this.elementModalStyle );

            //prepare placeholder to hold the work's space in the list
            this.placeHolderModalStyle = {
                height: box.height + 'px',
                width: box.width + 'px',
                display: 'block'
            };
            Object.assign( this.placeholder.current.style, this.placeHolderModalStyle );

            //transition after one dom render
            setTimeout( ()=> {
                this.element.current.classList.add( 'work--modal' );
                this.props.actions.allowScroll( false );
            }, 100 );

        } else {
            //return work to list view and hide placeholder
            for (let key of Object.keys( this.elementModalStyle )) {
                this.element.current.style[ key ] = null;
            }
            this.element.current.classList.remove( 'work--modal' );
            this.props.actions.allowScroll( true );
            for (let key of Object.keys( this.placeHolderModalStyle )) {
                this.placeholder.current.style[ key ] = null;
            }
        }
        this.updateHash();
    }

    componentDidUpdate ( prevProps, prevState, snapshot ) {
    }

    metaActions ( meta ) {
        return {
            change: ( data )=>this.props.actions.metaChange( meta, data ),
            textChange: ( text )=> {
                meta.data.text = text;
                this.props.actions.metaChange( meta, meta.data );
            },
            urlChange: ( url )=> {
                meta.data.url = url;
                this.props.actions.metaChange( meta, meta.data );
            },
            remove: ()=>this.props.actions.removeMeta( meta )
        };
    }

    renderMetaList ( metaData ) {
        return metaData.map( ( meta )=> {
            if (meta.type === 'sound') {
                return <div key={meta.id}>
                    <LinkField
                        id={meta.id}
                        actions={this.metaActions(meta)}
                        text={meta.data.text}
                        url={meta.data.url}/>
                </div>
            } else if (meta.type === 'texture') {
                return <div key={meta.id}>
                    <TextField
                        allowEdit={this.props.allowEdit}
                        id={meta.id}
                        multiline={false}
                        actions={this.metaActions( meta )}
                        content={meta.data}/>
                </div>
            } else {
                return <div key={meta.id}>
                    <TextField
                        allowEdit={this.props.allowEdit}
                        id={meta.id}
                        multiline={true}
                        actions={this.metaActions( meta )}
                        content={meta.data}/>
                </div>
            }
        } );
    }

    renderMeta () {
        let sounds = this.props.data.metaData.filter( m=>m.type == 'sound' );
        let stories = this.props.data.metaData.filter( m=>m.type == 'story' );
        let textures = this.props.data.metaData.filter( m=>m.type == 'texture' );
        let markup = [];
        if (sounds.length > 0 || this.props.allowEdit) {
            markup.push(
                <div key={'sounds'}>
                    <h4 className={!sounds.length?'work__meta-heading work__meta-heading--empty':'work__meta-heading'}>{sounds.length > 1 ? 'sounds' : 'sound'}
                        <a className="work__add-meta-button" onClick={()=>this.props.actions.addMeta( 'sound' )}>
                            +
                        </a>
                    </h4>
                    {this.renderMetaList( sounds )}
                </div>
            );
        }
        if (textures.length > 0 || this.props.allowEdit) {
            markup.push(
                <div key={'textures'}>
                    <h4 className={!textures.length?'work__meta-heading work__meta-heading--empty':'work__meta-heading'}>{textures.length > 1 ? 'textures' : 'texture'}
                        <a className="work__add-meta-button" onClick={()=>this.props.actions.addMeta( 'texture' )}>
                            +
                        </a>
                    </h4>
                    {this.renderMetaList( textures )}
                </div>
            );
        }
        if (stories.length > 0 || this.props.allowEdit) {
            markup.push(
                <div key={'stories'}>
                    <h4 className={!stories.length?'work__meta-heading work__meta-heading--empty':'work__meta-heading'}>{stories.length > 1 ? 'stories' : 'story'}
                        <a className="work__add-meta-button" onClick={()=>this.props.actions.addMeta( 'story' )}>
                            +
                        </a>
                    </h4>
                    {this.renderMetaList( stories )}
                </div>
            );
        }
        return markup;
    }

    imageTitle () {
        return (`${this.props.data.assetData.title.display}, ${this.props.data.assetData.date.display}, ${this.props.data.assetData.artists.map( a => a.artist.name_display + ', ' )}`).slice( 0, -2 );
    }

    render () {
        return (
            <div>
                <div ref={this.placeholder}
                     className="work__placeholder">

                </div>
                <div className="work" ref={this.element}>
                    <div className="work__image">
                        <img
                            onClick={this.toggleDetailView}
                            onMouseEnter={(e)=>e.preventDefault()}
                            src={this.props.data.assetData.images[ 0 ].public_image}/>
                        <div className="work__caption">
                            {this.props.data.assetData.artists.map(
                                (a,i) => <span key={a.artist.name_display}>{a.artist.name_display}{i===this.props.data.assetData.artists.length-1?'':','} </span>
                            )}
                            <span>{this.props.data.assetData.title.display} </span>
                            <span> {this.props.data.assetData.date.display}</span>
                        </div>
                    </div>

                    <div className="work__meta">
                        <div className="close-button" onClick={this.toggleDetailView}>
                            <i className="fa fa-times-thin"></i>
                        </div>
                        <h2>{this.props.data.assetData.title.display}</h2>
                        <h3>
                            {this.props.data.assetData.artists.map(
                                a => <span key={a.artist.name_display}>{a.artist.name_display},</span>
                            )}
                            <span> {this.props.data.assetData.date.display}</span>
                        </h3>
                        {this.renderMeta()}
                    </div>
                </div>
            </div>
        );
    };

}

export default Work;