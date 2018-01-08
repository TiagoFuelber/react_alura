import React, { Component } from 'react';
import $ from 'jquery';
import InputCustomizado from './componentes/InputCustomizado';
import PubSub from 'pubsub-js';
import TratadorErros from  './TratadorErros';

class FormularioLivro extends Component {

    constructor() {
        super();    
        this.state = {titulo: '', preco: '', autor: ''};
        this.enviaForm = this.enviaForm.bind(this);
        this.setTitulo = this.setTitulo.bind(this);
        this.setPreco = this.setPreco.bind(this);
        this.setAutor = this.setAutor.bind(this);
    }
  
    enviaForm(evento){
        evento.preventDefault();    
        $.ajax({
            url:'http://cdc-react.herokuapp.com/api/livros',
            contentType:'application/json',
            dataType:'json',
            type:'post',
            data: JSON.stringify(
                {
                    titulo: this.state.nome,
                    preco: this.state.preco, 
                    autor: this.state.autor
                }
            ),
            success: function(novaListagem){
                PubSub.publish('atualiza-lista-livros', novaListagem);        
                this.setState(
                    {
                        titulo: '',
                        preco: '',
                        autor: ''
                    }
                );
            }.bind(this),
            error: function(resposta){
                if(resposta.status === 400) {
                    new TratadorErros().publicaErros(resposta.responseJSON);
                }
            },
            beforeSend: function(){
                PubSub.publish("limpa-erros",{});
            }      
        });
    }
  
    setTitulo(evento){
        this.setState({titulo: evento.target.value});
    }
  
    setPreco(evento){
        this.setState({preco: evento.target.value});
    }  
  
    setAutor(evento){
        this.setState({autor: evento.target.value});
    }  
  
    render() {
        return (
            <div className="pure-form pure-form-aligned">
                <form className="pure-form pure-form-aligned" onSubmit={this.enviaForm} method="post">
                    <InputCustomizado 
                        id="titulo" 
                        type="text" 
                        name="titulo" 
                        value={this.state.titulo} 
                        onChange={this.setTitulo} 
                        label="Título"/>                                              

                    <InputCustomizado 
                        id="preco" 
                        type="email" 
                        name="preco" 
                        value={this.state.preco} 
                        onChange={this.setPreco} 
                        label="Preço"/>                                              

                    <InputCustomizado 
                        id="autor" 
                        type="password" 
                        name="autor" 
                        value={this.state.autor} 
                        onChange={this.setAutor} 
                        label="Autor"/>                                                                      

                    <div className="pure-control-group">                                  
                        <label></label> 
                        <button type="submit" className="pure-button pure-button-primary">Gravar</button>                                    
                    </div>
                </form>             
            </div>  
        );
    }
}
  
class TabelaLivros extends Component {

    render() {
        return(
            <div>            
                <table className="pure-table">
                    <thead>
                    <tr>
                        <th>Título</th>
                        <th>Preço</th>
                        <th>Autor</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        this.props.lista
                            .filter(function(livro) {
                                return livro.titulo;
                            })
                            .map(function(livro){
                                return (
                                    <tr key={livro.id}>
                                        <td>{livro.titulo}</td>
                                        <td>{livro.preco}</td>
                                        <td>{livro.autor}</td>
                                    </tr>
                            );
                        })
                    }
                    </tbody>
                </table> 
            </div>                     
        );
    }
}
  
export default class LivroBox extends Component {

    constructor() {
        super();    
        this.state = {lista: []};    
    }
  
    componentDidMount() {  
        $.ajax({
            url:"http://cdc-react.herokuapp.com/api/livros",
            dataType: 'json',
            success:function(resposta){    
                this.setState({lista: resposta});
            }.bind(this)
        });          
  
        PubSub.subscribe('atualiza-lista-livros',function(topico, novaLista){
            this.setState({lista: novaLista});
        }.bind(this));
    }   
  
  
    render() {
        return (
            <div>
                <div className="header">
                    <h1>Cadastro de livros</h1>
                </div>
                <div className="content" id="content">                            
                    <FormularioLivro/>
                    <TabelaLivros lista={this.state.lista}/>        
                </div>      
            </div>
        );
    }
}