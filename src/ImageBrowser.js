import React, { Component } from 'react';
import {debounce} from 'throttle-debounce';

import TextField from './TextField';

import './ImageBrowser.css';


class ImageBrowser extends Component {

    constructor( props ) {
        super( props );

        this.state = { loading: false, objects: [], query: 'enter search term' };
        this.page = 1;
        this.pageSize = 20;

        this.modalElement = React.createRef();

        this.loadObjectsDebounced = debounce( 1000, this.loadObjects );
        this.scroll = this.scroll.bind( this );
        this.hide = this.hide.bind( this );
        this.updateQuery = this.updateQuery.bind( this );
        this.imageAlt = this.imageAlt.bind( this );
        this.chooseObject = ()=> {
        };
        this.cancelSelection = ()=> {
        };
    }

    componentDidMount() {
        this.loadObjects( this.state.query );
    }

    render() {
        return (
            <div ref={this.modalElement} className="modal-container">
                <div className="close-button" onClick={this.hide}>
                    <i className="fa fa-times-thin"></i>
                </div>
                <div className="image-browser">
                    <div className="image-browser__query">
                        search:
                        <input type="text"
                               value={this.state.query}
                               onChange={(e)=>{this.updateQuery(e.target.value)}}
                        />
                    </div>
                    <div className="image-browser__scroller" onScroll={this.scroll}>
                        {this.state.objects.map( ( o, i )=> {
                            return (
                                <div className="image-browser__image" key={i+o.accession.number}>
                                    <img src={o.images[0].public_image}
                                         onClick={()=>this.chooseObject&&this.chooseObject( o )}
                                         alt={this.imageAlt(o)}
                                    />
                                    <div className="image-browser__caption">
                                        {o.artists.map(
                                            a => <span key={a.artist.name_display}>{a.artist.name_display}, </span>
                                        )}
                                        <span>{o.title.display}, </span>
                                        <span> {o.date.display}</span>
                                    </div>
                                </div>
                            )
                        } )}
                        <div className={this.state.loading ?'image-browser__loading-indicator image-browser__loading-indicator--loading':'image-browser__loading-indicator'}>
                            Loading...
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    imageAlt( o ) {
        return (`${o.title.display}, ${o.date.display}, ${o.artists.map( a => a.artist.name_display + ', ' )}`).slice( 0, -2 );
    }

    show() {
        this.modalElement.current.classList.add( 'modal-container--visible' );
        this.props.actions.allowScroll( false );
        return new Promise( ( resolve, reject ) => {
            this.chooseObject = ( o )=> {
                resolve( o );
                this.cancelSelection = null;
                this.chooseObject = null;
                this.hide();
            };
            this.cancelSelection = reject;
        } );
    }

    hide() {
        this.cancelSelection && this.cancelSelection();
        this.modalElement.current.classList.remove( 'modal-container--visible' );
        this.props.actions.allowScroll( true );
    }

    updateQuery( query, reset = true ) {
        if ( query !== this.state.query ) {
            if ( reset ) {
                this.page = 1;
                this.setState( { objects: [] } );
            }
            this.loadObjectsDebounced( query );
            this.setState( { query: query } );
        }
    }

    loadObjects( query ) {
        this.setState( { loading: true } );
        this.props.actions.loadObjects( query, this.page, this.pageSize )
            .then( ( objects )=> {
                this.setState( { loading: false } );
                if ( objects ) {
                    this.setState( {
                        objects: this.state.objects.concat( objects.filter( o=>o.images.length > 0 ) )
                    } );
                }
            } );
    }

    scroll( e ) {
        if ( e.target.scrollTop + e.target.offsetHeight >= e.target.scrollHeight ) {
            this.page++;
            this.loadObjects( this.state.query, false );
        }
    }

}

export default ImageBrowser;