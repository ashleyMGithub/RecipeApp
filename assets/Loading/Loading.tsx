import React from 'react'
import {View, SafeAreaView, ActivityIndicator, StyleSheet, StatusBar, Platform, Dimensions} from 'react-native'

const DimData = Dimensions.get("window")
const status_bar_height:number = (StatusBar.currentHeight==undefined) ? 0 : StatusBar.currentHeight;

interface LoadingProps{

}

interface LoadingState{
    isLoading: boolean
}

export default class Loading extends React.Component<LoadingProps, LoadingState>{
    constructor(value:boolean){
        super(value);
        this.state={
            isLoading:value
        }
        
    }

    getLoadingScreen = () => {
        return(
            <View style={styles.container}>
                <StatusBar barStyle={(Platform.OS=='ios') ? 'dark-content':'light-content'}/>
                <SafeAreaView style={[styles.HomePage, {alignItems:'center', justifyContent:'center'}]}>
                  <ActivityIndicator size="large" color='black'/>
                </SafeAreaView>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        height: DimData.height - status_bar_height,
        width: DimData.width,
        backgroundColor: 'blue',
        alignItems: 'center',
        justifyContent: 'center',
      },
      HomePage:{
        height:'100%',
        width:'100%',
        backgroundColor:'#ffdcb5'
      },
})