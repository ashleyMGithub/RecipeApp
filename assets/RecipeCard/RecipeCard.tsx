import React, { Component, ReactNode } from 'react'
import { View, StyleSheet, Text, Dimensions, Image } from 'react-native';
import Recipe from './Recipe'
import AppImages from '../Images/Images.js'


interface RecipeCardProps{
    food_data_default: Recipe
}

interface RecipeCardState{
    food_data: Recipe
}

const DimData = Dimensions.get("window")

const food_images: { [key: string]: any }={
    food:{
        bolognese: require('../Images/Food/bolognese.jpg'),
        potato: require('../Images/Food/potato.jpg'),
        english_breakfast: require('../Images/Food/english_breakfast.jpg'),
        fruit_salad: require('../Images/Food/fruit_salad.jpg'),
        banana_pudding: require('../Images/Food/banana_pudding.jpg'),
        butter_chicken: require('../Images/Food/butter_chicken.jpg'),
        jollof_rice: require('../Images/Food/jollof_rice.jpg'),
        white_rice: require('../Images/Food/white_rice.jpg'),
        meatballs: require('../Images/Food/meatballs.jpg')
    }
}

export default class RecipeCard extends Component<Recipe, RecipeCardState>{
    RecipePhotoCard: any;
    RecipeProfileCard: any;
    constructor(props : Recipe){
        super(props);
        this.state={
            food_data: this.props,
        }
        this.RecipePhotoCard = React.createRef();
        this.RecipeProfileCard = React.createRef();
    }

    getPhotoCardRef(){
        return this.RecipePhotoCard
    }

    getProfileCardRef(){
        return this.RecipeProfileCard
    }

    getProfileTab(caption: string){
        return(
            <View style={styles.RecipeCard_Profile_Tab}>
                <Text>{caption}</Text>
            </View>
        )
    }

    getPhotoCard(recipe: Recipe){
        let imageView = this.getImage(recipe.image_tag, recipe.title)
        return(
            <View style={[styles.RecipePage, {alignItems:'center', justifyContent:'center',}]}
            onLayout={(event => (this.RecipePhotoCard = event.nativeEvent.layout))}
            >
                <View style={styles.RecipeCard_Photo}>
                    {imageView}
                </View>
            </View>
        )
    }

    getImage(tag:string, title:string){
        return (title=="") 
        ? <Image style={styles.RecipeImage} source={AppImages.placeholder["defaultRecipe"]}/>:
        <Image style={styles.RecipeImage} source={food_images.food[tag]}/>
    }
    
    getCard(recipe: Recipe){
        let imageView = this.getImage(recipe.image_tag, recipe.title)
        return(
            <View style={styles.RecipePage}
            onLayout={(event => {this.RecipeProfileCard = event.nativeEvent.layout})}>
                <View style={styles.RecipeCardCanvas}>
                    <View style={styles.RecipeCard_Picture_Canvas}>
                        {imageView}
                    </View>
                    <View style={styles.RecipeCard_Profile_Canvas}>
                        {this.getProfileTab(recipe.difficulty)}
                        {this.getProfileTab(recipe.meal_type)}
                        { (recipe.title!="") ? this.getProfileTab("serves: " + recipe.serves):this.getProfileTab("")}
                    </View>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    RecipeCardCanvas:{
        height: '100%',
        width: DimData.width,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent:'center',
    },
    RecipeCard_Picture_Canvas:{
        height:'70%',
        width:'100%',
        backgroundColor:'black',
        alignItems:'center',
        justifyContent:'center'
    },
    RecipeCard_Picture:{
        height:'100%',
        width:'100%',
        backgroundColor:'white'
    },
    RecipeCard_Profile_Canvas:{
        height:'30%',
        width:'100%',
        backgroundColor:'#ffdcb5',
        flexDirection:'row'
    },
    RecipeCard_Profile:{
        height:'100%',
        width:'100%',
        backgroundColor:'grey',
        padding:'5%'
    },
    RecipeCard_Profile_Tab:{
        flex:1,
        alignItems:'center',
        justifyContent:'center',
    },
    RecipeScrollViewCanvas:{
        height: '100%',
        width:'80%',
        backgroundColor:'yellow'
    },
    RecipeScrollView:{
        flexDirection: 'row',
    },
    RecipeInfoButtonTemplate_canvas:{
        height:'70%',
        width:'80%',
        backgroundColor:'white'
    },
    RecipeInfoButtonTemplate:{
        height:'100%',
        width:'100%',
        backgroundColor:'white',
        alignItems:'center',
        justifyContent:'center'
    },
    RecipePage:{
        height:'100%',
        width: DimData.width,
        flexDirection:'row',
    },
    RecipeCard_PhotoCanvas_Area:{
        height:'100%',
        width: DimData.width,
        alignItems:'center',
        justifyContent:'center'
    },
    RecipeCard_PhotoButton_Area:{
        height:'100%',
        width: DimData.width *0.15,
        backgroundColor:'blue',
        alignItems:'center',
        justifyContent:'center'
    },
    RecipeCard_PhotoButton:{
        height:'50%',
        width:'80%',
        backgroundColor:'white',
        alignItems:'center',
        justifyContent:'center',
        borderRadius:10
    },
    RecipeCard_Photo:{
        height:'100%',
        width:'100%',
        borderRadius:10,
        backgroundColor:'white',
    },
    RecipeImage:{
        height:'100%',
        width:'100%',
        flex:1
    }
})