import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, Button, Image, TouchableOpacity, StatusBar, ScrollView } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import 'react-native-gesture-handler';
import AppBar from '../components/AppBar.js';
import { DataTable, IconButton, Portal, FAB } from 'react-native-paper';
import firebase from 'firebase';

class InventoryScreen extends React.Component{

    static navigationOptions = {
        headerShown: false
    }

    constructor(props){
      super(props);
      this.state = {
        data: [],
        sortDirection: 'ascending',
        sortBy: 0,
        uid: '',
        fabOpen: false,
        fabVisible: true
      }

    }

    refresh = () => {
      this.setState({ fabVisible: true });
      this.render();
    }


    componentDidMount() {
        firebase.auth().onAuthStateChanged((user) => {
            if (user != null) {
                this.setState({ uid: user.uid });
                firebase.database().ref('users/' + user.uid + '/inventory').once("value")
                    .then((snapshot) => {
                        var itemKeys = Object.keys(snapshot.val())
                          .map( item => {
                            return item;
                          });
                        var itemVals = Object.keys(snapshot.val())
                          .map( item => {
                            return snapshot.val()[item];
                          });
                        var newData = itemKeys.map( (item, idx) => {
                          return {key: item, value: itemVals[idx]}
                        });
                        this.setState({data: newData});
                    });

            }
        })
    }

    addOne = (idx) => {
      var obj = this.state.data[idx];
      obj.value = Number(obj.value) + 1;

      firebase.database().ref('users/' + this.state.uid + '/inventory').update({
        [obj.key]: obj.value
      });

      var newData = this.state.data;
      newData[idx] = obj;

      this.setState({data: newData});
    }

    minusOne = (idx) => {
      var obj = this.state.data[idx];
      obj.value = Number(obj.value) - 1;
      if(obj.value < 0) obj.value = 0;

      firebase.database().ref('users/' + this.state.uid + '/inventory').update({
        [obj.key]: obj.value
      });

      var newData = this.state.data;
      newData[idx] = obj;

      this.setState({data: newData});
    }

    sortByFood(){

      if(this.state.sortBy == 0) {
        if(this.state.sortDirection == 'ascending'){
          this.setState({sortDirection: 'descending'});
        }
        else{
          this.setState({sortDirection: 'ascending'});
        }
      }

      var arr = this.state.data;

      if(this.state.sortDirection == 'ascending'){
        arr.sort((a, b) => {
          if(a.key < b.key) return -1;
          if(a.key > b.key) return 1;
          return 0;
        });
      }
      else{
        arr.sort((a, b) => {
          if(a.key < b.key) return 1;
          if(a.key > b.key) return -1;
          return 0;
        });
      }

      this.setState({data: arr});
      this.setState({sortBy: 0});
    }

    sortByQuantity(){

      if(this.state.sortBy == 1) {
        if(this.state.sortDirection == 'ascending'){
          this.setState({sortDirection: 'descending'});
        }
        else{
          this.setState({sortDirection: 'ascending'});
        }
      }

      var arr = this.state.data;

      if(this.state.sortDirection == 'ascending'){
        arr.sort((a, b) => {
          if(a.value < b.value) return -1;
          if(a.value > b.value) return 1;
          return 0;
        });
      }
      else{
        arr.sort((a, b) => {
          if(a.value < b.value) return 1;
          if(a.value > b.value) return -1;
          return 0;
        });
      }

      this.setState({data: arr});
      this.setState({sortBy: 1});
    }

    addTableRows(){
      return this.state.data.map((item, idx) => {
        return (
          <DataTable.Row style={styles.dataItem} key = {idx}>

              <DataTable.Cell style={{}}><Text style={{color:'#000a13'}}>{item.key}</Text></DataTable.Cell>
            <DataTable.Cell  numeric>
                <View style={styles.dataCell}>
                    <IconButton icon="minus-circle-outline" onPress={ () => this.minusOne(idx) }/>
                    <Text style={{color:'#000a13'}}>{item.value}</Text>
                    <IconButton icon="plus-circle-outline" onPress={ () => this.addOne(idx) }/>
                </View>
            </DataTable.Cell>

          </DataTable.Row>
        );
      });
    }


    render(){

        var header;
        if(this.state.sortBy == 0){
          header = <DataTable.Header style={styles.dataHeader}>
                      <DataTable.Title sortDirection={this.state.sortDirection} >
                        <TouchableOpacity onPress = {() => {this.sortByFood()} }><Text style={{fontWeight: 'bold'}}>Food</Text></TouchableOpacity>
                      </DataTable.Title>
                    
                      <DataTable.Title style={{paddingRight:25}} numeric >
                        <TouchableOpacity onPress = {() => this.sortByQuantity() }><Text style={{fontWeight: 'bold'}}>Quantity</Text></TouchableOpacity>
                      </DataTable.Title>
                  </DataTable.Header>;
        }
        else{
          header = <DataTable.Header style={styles.dataHeader}>
                      <DataTable.Title>
                        <TouchableOpacity onPress = {() => {this.sortByFood()} }><Text style={{fontWeight: 'bold'}}>Food</Text></TouchableOpacity>
                      </DataTable.Title>
                    
                      <DataTable.Title style={{paddingRight:25}} sortDirection={this.state.sortDirection} numeric >
                        <TouchableOpacity onPress = {() => this.sortByQuantity() }><Text style={{fontWeight: 'bold'}}>Quantity</Text></TouchableOpacity>
                      </DataTable.Title>
                  </DataTable.Header>;
        }

        return(
            <SafeAreaView style = {styles.container}>
              <AppBar navigation = {this.props.navigation} title = "Inventory"/>
              <ScrollView>
                <View style={styles.innerContainer}>

                  <View style={styles.bottomContainer}>

                    <DataTable style={styles.dataTable}>
                      {header}

                      {this.addTableRows()}

                    </DataTable>

                  </View>

                </View>
              </ScrollView>
              <Portal>
                <FAB.Group 
                  open = {this.state.fabOpen}
                  icon = {this.state.fabOpen ? 'close' : 'plus'}
                  visible = {this.state.fabVisible}
                  actions = {[
                    {
                      icon: 'camera',
                      label: 'Take Picture',
                      onPress: () => { this.setState({ fabVisible: false}); this.props.navigation.navigate('Scan', { refresh: this.refresh })}
                    },
                    {
                      icon: 'pencil',
                      label: 'Type',
                      onPress: () => { this.setState({ fabVisible: false}); this.props.navigation.navigate('Type', { refresh: this.refresh })}
                    },
                  ]}
                  onStateChange={() => this.setState({ fabOpen: !this.state.fabOpen })}
                  onPress={() => {
                    if (this.state.fabOpen) {
                      this.setState({fabOpen: false});
                    }
                    else {
                      this.setState({fabOpen: true});
                    }
                  }}
                />
              </Portal>

            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000a13'
  },
  innerContainer: {
    flex: 1,
    alignItems: 'stretch',
  },
  bottomContainer: {
    flex: 8,
    alignItems: 'stretch',


  },
  dataTable: {

  },
  dataHeader: {
      height:70,
      paddingTop:20,
      backgroundColor: "#95db93",
      fontWeight:'bold'
  },
  dataItem:{
      backgroundColor:"#F7F7F7",
  },
  dataCell:{
    flexDirection:'row', alignItems:'center',


  }
});

export default InventoryScreen;
