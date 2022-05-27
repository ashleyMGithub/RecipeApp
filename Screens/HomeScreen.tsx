import { Dimensions, SafeAreaView, StyleSheet, Text, ScrollView, TouchableOpacity, View, StatusBar, Platform, Modal, FlatList, ActivityIndicator, Image } from 'react-native';
import React, { Component, ReactNode } from 'react'
import Recipe from '../assets/RecipeCard/Recipe';
import RecipeCard from '../assets/RecipeCard/RecipeCard';
import { TextInput } from 'react-native-gesture-handler';
import Loading from '../assets/Loading/Loading';
import AppImages from '../assets/Images/Images.js'

//Grab JSON data
const recipe_info = require("../assets/Info/RecipeInfo.json")

//import Dimensions
const DimData = Dimensions.get("window")

//Container heights
const recipeCardCanvas_height:string = '40%';
const recipeListCanvas_height:string = '60%';

const footerCanvasArea_height:string = '10%';
const footerCanvas_height:string = '100%';

const Search_SearchBarCanvasArea_height:string = '20%';
const Search_SearchesCanvasArea_height:string = '80%';

//Get Platform
const user_platform:string = Platform.OS;
const status_bar_height:number = (StatusBar.currentHeight==undefined) ? 0 : StatusBar.currentHeight;

//RecipeCard object
let recipe_obj:Recipe = new Recipe("", "", 8, ["",""], ["",], "defaultRecipe", "");
let recipe_card_obj:RecipeCard =  new RecipeCard(recipe_obj)

//MealDB
let MealDB_Active_Recipe_Data:any = []

//Modal
const RecipeOverlay_MainScrollView_width:number = DimData.width * 0.9
const mealDBOverlay_MainScrollView_width:number = DimData.width

//stockData
const stockRecipes:string[] = ["Bolognese","Potato", "English Breakfast", "Butter Chicken",
                            "Banana Pudding", "Fruit Salad", "Meatballs", "White Rice"]
let stockRecipeView:any = undefined

interface HomeScreenProps{
  activeStateDefault:string
  activeRecipeCard_infoDefault: Recipe
}

interface AppState{
  activeRecipe: string
  activeRecipeCard_info: Recipe
  activeRecipeCard_overlay_tab: string
  ingredientsOverlay_visible: boolean
  modal_visible: boolean
  masterData: {name:string}[]
  filterData: {name:string}[]
  searchText: string
  searchText_firstChar: string
  searchData:any
  isLoading: boolean
  loading_obj: Loading
  mealDB_overlay_visible: boolean
}

const app_recipes:{name:string}[] = []

export default class HomeScreen extends Component<HomeScreenProps, AppState>{
    RecipeCard_ScrollViewRef: any;
    MainScrollView_Ref: any;
    Overlay_ingredientsPage: any;
    Overlay_prepStepsPage: any;
    RecipePage: any;
    SearchPage: any;
    overlay_scrollViewRef: any;
    mealDBIngredientsPage: any;
    mealDBStepsPage: any;
    mealDBModalScrollViewRef:any;

    constructor(props: HomeScreenProps){
        super(props);
        this.state={
          activeRecipe: this.props.activeStateDefault,
          activeRecipeCard_info: new Recipe("", "Select A Recipe", 8, ["",""], ["",], "defaultRecipe", ""),
          ingredientsOverlay_visible: false,
          modal_visible: false,
          activeRecipeCard_overlay_tab: "Ingredients",
          masterData: app_recipes,
          filterData: app_recipes,
          searchText: "",
          searchText_firstChar: "",
          searchData:[],
          isLoading: true,
          loading_obj: new Loading(true),
          mealDB_overlay_visible:false
        }
        this.RecipeCard_ScrollViewRef = React.createRef();
        this.MainScrollView_Ref = React.createRef();
        this.RecipePage = React.createRef();
        this.SearchPage = React.createRef();
        this.overlay_scrollViewRef = React.createRef();
        this.Overlay_ingredientsPage = React.createRef();
        this.Overlay_prepStepsPage = React.createRef();
        this.mealDBIngredientsPage = React.createRef();
        this.mealDBStepsPage = React.createRef();
        this.mealDBModalScrollViewRef = React.createRef();
    }

    //Create Bottom Footer
  getBottomFooter(){
    return(
      <View style={styles.FooterCanvas}> 
        <TouchableOpacity style={styles.FooterTab} onPress={() => this.useScroller(this.RecipePage, this.MainScrollView_Ref)}><Text>Recipes</Text></TouchableOpacity>
        <TouchableOpacity style={styles.FooterTab} onPress={() => this.useScroller(this.SearchPage, this.MainScrollView_Ref)}><Text>Search</Text></TouchableOpacity>
      </View>
    )
  }

    //Get Recipe 
    getRecipeButton(title:string, keyID:number){
      const recipe = recipe_info[title][0]
      let food: Recipe = new Recipe(recipe.title, recipe.meal_type, recipe.serves, 
        recipe.ingredients, recipe.prep_steps, recipe.image_tag, recipe.difficulty)
      return(
        <View style={styles.RecipeButtonCanvas} key={keyID}>
          <TouchableOpacity style={(title == this.state.activeRecipe) ? styles.RecipeButtonActive : styles.RecipeButtonInactive}
          onPress={() => [this.updateActiveRecipe(food)]}>
            <Text>{title}</Text>
          </TouchableOpacity>
        </View>
      )
    }

    searchItem = ({item}:any) => {
      <View style={{width:'100%', height:'10%', backgroundColor:'pink'}}>
        <Text>{item.name}</Text>
      </View>
    }

    getModalPage = (content:string) => {
      const recipe_page_info:{name:string, amount:string, number:string, step:string}[] = (this.state.activeRecipe==undefined) ? [] : recipe_info[this.state.activeRecipe][0][content]
      let pageView = []
      pageView.push(recipe_page_info.map(function(data:{
        name:string
        amount:string
        number:string
        step:string
      }):any {
        let view = (content == "ingredients") ? <Text>{data.name + " - " + data.amount}</Text> : <Text>{data.number + " - " + data.step}</Text>
        return(<View style={{alignItems:'center', justifyContent:'center', height:DimData.height*0.1, paddingHorizontal:'5%'}} key={"Recipe" + Math.random()}>
          {view}
        </View>
        )
      }))
      return(
        <View style={styles.ModalScrollviewPage}>
          <ScrollView horizontal={false} style={{width: RecipeOverlay_MainScrollView_width, height:DimData.height * 0.5}}>
            {pageView}
          </ScrollView>
        </View>

      )
    }

    getModalHeaderButton = (title:string) =>{
      return(
        <View style={styles.RecipeCardOverlay_Header_ButtonCanvas}>
          <TouchableOpacity style={styles.RecipeCardOverlay_Header_Button} onPress={() => this.updateActiveOverlayTab(title, this.getPageRef(title) , this.overlay_scrollViewRef)}>
            <Text>{title}</Text>
          </TouchableOpacity>
          <View style={[styles.RecipeCardOverlay_Header_Indicator, {backgroundColor: (this.state.activeRecipeCard_overlay_tab==title) ? 'black' : '#ffdcb5'}]}/>
        </View>
      )
    }

    /*
      On each render, the references for view components are initially null
      Therefore if I have a button that scrolls to reference X with onPress
      And the button is declared before reference X has been set
      The button will scroll to null (nothing)
    */
    getPageRef(pageRef:string): void{
      switch(pageRef){
        case 'Ingredients': return this.Overlay_ingredientsPage;
        case 'Prep Steps': return this.Overlay_prepStepsPage;
        case 'mealDB_Ingredients': return this.mealDBIngredientsPage;
        case 'mealDB_Steps': return this.mealDBStepsPage;
      }
    }

    getCallingCard(text:string){
      return(
        <View style={styles.openMealDBModal_CallingCard}>
          <Text>{text}</Text>
        </View>
      )
    }

    getMealDBScrollerButton(text:string, scrollTo_tag:any){
      return(
        <View style={{flex:1, width:'100%', justifyContent:'center', alignItems:'center'}}>
          <TouchableOpacity style={[styles.RecipeCardButton, {height:'50%', width:'60%'}]} onPress={() => {this.useScroller(this.getPageRef(scrollTo_tag), this.mealDBModalScrollViewRef)}}>
            <Text style={styles.RecipeCardButtonText}>{text}</Text>
          </TouchableOpacity>
        </View>
      )
    }

    getMealDBModal(isVisible:boolean, recipe_info:any){
      return(
        <Modal animationType='slide' transparent={true} visible={isVisible}>
          <SafeAreaView style={[styles.ModalArea, {justifyContent:'flex-end', alignItems:'center'}]}>
            <View style={styles.openMealDBModalCanvas}>
              <View style={styles.openMealDBModalCloseButtonArea}>
                <TouchableOpacity style={styles.openMealDBModalCloseButton} onPress={() => this.closeMealDBModal()}>
                  <Image style={{height:'100%', width:'100%'}} resizeMode='contain' source={AppImages.ButtonIcon.cancel}/>
                </TouchableOpacity>
              </View>
              <View style={styles.openMealDBModal_PictureCanvas}>
                <Image style={styles.openMealDBModal_Picture} source={{uri: recipe_info.imageLocation}}/>
              </View>
              <View style={styles.openMealDBModal_ContentArea}>
                  {this.getCallingCard(recipe_info.title)}
                  <View style={{height:DimData.height*0.10, width:DimData.width, flexDirection:'row'}}>
                    {this.getMealDBScrollerButton("Ingredients", "mealDB_Ingredients")}
                    {this.getMealDBScrollerButton("Steps", "mealDB_Steps")}
                  </View>
                  <ScrollView horizontal pagingEnabled scrollEnabled={false} showsHorizontalScrollIndicator={false} ref={this.mealDBModalScrollViewRef}>
                    <View style={{flex:1, width:DimData.width, backgroundColor: 'orange'}}
                    onLayout={(event => {this.mealDBIngredientsPage = event.nativeEvent.layout})}
                    >
                      <FlatList
                      data={recipe_info.ingredientData}
                      keyExtractor={(item)=>item.id}
                      renderItem={({item}) =>(
                        <Text style={{paddingLeft:'5%', margin:'2.5%', justifyContent:'center'}}>{item.ingredient + " - " + item.amount}</Text>
                      )}
                      />
                    </View>
                    <View style={{flex:1, width:DimData.width, justifyContent:'center', alignItems:'center', backgroundColor:'orange'}}
                    onLayout={(event) => {this.mealDBStepsPage = event.nativeEvent.layout}}>
                      <ScrollView horizontal={false} showsVerticalScrollIndicator={true}>
                        <Text style={{paddingLeft:'5%', margin:'2.5%', justifyContent:'center', lineHeight:30}}>{recipe_info.step}</Text>
                      </ScrollView>
                    </View>
                  </ScrollView>
              </View>
            </View>
          </SafeAreaView>
        </Modal>
      )
    }

    getModal(isVisible: boolean){
      return(
        <Modal animationType='slide' transparent={true} visible={isVisible}>
          <View style={styles.ModalArea}>
            <View style={styles.ModalCanvas}>
              <View style={styles.ModalPopup}>
                <View style={styles.ModalPopup_header}>
                  {this.getModalHeaderButton("Ingredients")}
                  {this.getModalHeaderButton("Prep Steps")}
                </View>
                <View style={styles.ModalPopup_body}>
                  <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} bounces={false}
                  ref={this.overlay_scrollViewRef} scrollEnabled={false}>
                    <View onLayout={(event => {this.Overlay_ingredientsPage = event.nativeEvent.layout})}>
                      {this.getModalPage("ingredients")}
                    </View>
                    <View onLayout={(event => {this.Overlay_prepStepsPage = event.nativeEvent.layout})}>
                      {this.getModalPage("prep_steps")}
                    </View>
                  </ScrollView>
                </View>
                <View style={styles.ModalPopup_footer}>
                  <TouchableOpacity style={styles.ModalPopup_CloseButton} onPress={() => this.closeModal()}>
                    <Text>Close</Text> 
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      )
    }

    openModal(): void{
      this.setState({
        modal_visible: true
      }, () => this.updateIngredientsOverlay(true))
    }

    openMealDBModal(): void{
      this.setState({
        modal_visible: true
      }, () => this.updateMealDBOverlay(true))
    }

    closeModal(): void{
      this.setState({
        modal_visible: false,
        activeRecipeCard_overlay_tab: "Ingredients"
      }, () => this.updateIngredientsOverlay(false))
    }

    closeMealDBModal(): void{
      this.setState({
        mealDB_overlay_visible: false,
      }, () => this.updateMealDBOverlay(false))
      MealDB_Active_Recipe_Data=[]
    }

    updateActiveRecipe(food:Recipe){
      this.setState({
        activeRecipe: food.title
      }, () =>  this.updateRecipeCard(food))
    }

    updateRecipeCard(recipe: Recipe){
      this.setState({
        activeRecipeCard_info: recipe
      })
    }

    updateActiveOverlayTab(tab: string, scrollTo_Ref:any, scrollView_Ref:any):void{
      this.setState({
        activeRecipeCard_overlay_tab: tab
      }, () => this.useScroller(scrollTo_Ref, scrollView_Ref))
    }

    useScroller(scrollTo_Ref : any, scrollView_Ref: any){
      scrollView_Ref.current.scrollTo({
        animated: true,
        x: scrollTo_Ref.x
      })
    }

    getIngredientsOverlay(isVisible:boolean){
      if(!isVisible) return;
      return(
        <View style={styles.AppOverlayArea}>
          <TouchableOpacity style={styles.AppOverlay} onPress={() => this.closeModal()}>
            {this.getModal(true)}
          </TouchableOpacity>
        </View>
      )
    }

    getMealDBOverlay(isVisible:boolean, data:any){
      if(!isVisible) return;
      return(
        <View style={styles.AppOverlayArea}>
          <View style={styles.AppOverlay}>
            {this.getMealDBModal(true, data)}
          </View>
        </View>
      )
    }

    updateIngredientsOverlay(isVisible: boolean){
      this.setState({
        ingredientsOverlay_visible: isVisible
      })
    }

    updateMealDBOverlay(isVisible: boolean){
      this.setState({
        mealDB_overlay_visible: isVisible
      })
    }

    searchFilter = (text: string) =>{
      if(text){
        const newData = app_recipes.filter(
          function(item){
            const itemData = item.name
            ? item.name : '';
            const textData = text
            return itemData.indexOf(textData) > -1;
          });
          this.setState({
            filterData: newData,
            searchText: text
          })
      }else{
        this.setState({
          filterData: this.state.masterData,
          searchText: text
        })
      }
    }

    openMealDBRecipe(name:string){
      const mealDBURL = "https://www.themealdb.com/api/json/v1/1/search.php?s=" + name;
      let index=1
      fetch(mealDBURL)
      .then((response) => response.json())
      .then((json) =>{
        
        MealDB_Active_Recipe_Data={
            title:name,
            imageLocation: json.meals[0]["strMealThumb"], 
            step:json.meals[0]["strInstructions"],
            tags:json.meals[0]["strTags"],
            ingredientData: [],
        }
        let mealDB_ingredient = json.meals[0]["strIngredient1"]
        while(mealDB_ingredient!=null && mealDB_ingredient.length != 0){
          MealDB_Active_Recipe_Data.ingredientData.push({
            ingredient: json.meals[0]["strIngredient" + index],
            amount: json.meals[0]["strMeasure" + index],
            id: index
          })
          index++;
          mealDB_ingredient = json.meals[0]["strIngredient" + index]
        }
      }).catch((error) =>{
        console.error(error)
      }).finally(() => {
        this.openMealDBModal()
      })
    }

    getSearchList(){
      let searchView = (this.state.filterData.length==0) ?
        <Text style={{marginTop:'5%', backgroundColor:'#FAEBD7', padding:'5%', textAlignVertical:'center', width:'70%', marginLeft:'5%', borderRadius:5}}>No search results found</Text>
      :
      <FlatList
          data={this.state.filterData}
          keyExtractor={(item) => item.name}
          renderItem={({item}) => (
              <TouchableOpacity style={{marginTop:'5%', backgroundColor:'#FAEBD7', padding:'5%', alignItems:'flex-start', width:'70%', marginLeft:'5%', borderRadius:5}}
              onPress={() => this.openMealDBRecipe(item.name)}><Text>{item.name}</Text></TouchableOpacity>
          )}
        />
      return(
        searchView
      )
    }
    
    fetchData(){
      fetch("http://www.themealdb.com/api/json/v1/1/search.php?f=c")
      .then((response) => response.json())
      .then((json) => {
        for(let data in json.meals){
          app_recipes.push({name: json.meals[data].strMeal})
        }
        this.setState({
          isLoading:false
        })
      }).catch((error) =>{
        console.log(error)
      })
    }

    componentDidMount(){
      this.fetchData();
    }

    render(): ReactNode {
        if(this.state.isLoading){
          return(
            this.state.loading_obj.getLoadingScreen()
          )
        }else{
          stockRecipeView = stockRecipes.map((recipe_name, index) =>{
            return this.getRecipeButton(recipe_name, index)
          })
          return (
            <View style={styles.container}>
              <StatusBar barStyle={(Platform.OS=='ios') ? 'dark-content':'light-content'}/>
                <SafeAreaView style={styles.HomePage}>
                    <View style={{height:'100%', width:'100%'}}>
                    <ScrollView horizontal pagingEnabled={true} bounces={false} style={styles.MainScrollView}
                    showsHorizontalScrollIndicator={false} scrollEnabled={false} ref={this.MainScrollView_Ref}>
                        <View style={styles.Page_ContentArea}
                        onLayout={(event => {this.RecipePage = event.nativeEvent.layout})}>
                          <ScrollView style={styles.RecipeCardCanvas} horizontal contentContainerStyle={{alignItems:'center', justifyContent:'center'}} 
                          pagingEnabled ref={this.RecipeCard_ScrollViewRef} scrollEnabled={false} showsHorizontalScrollIndicator={false}> 
                            {recipe_card_obj.getCard(this.state.activeRecipeCard_info)}
                            {recipe_card_obj.getPhotoCard(this.state.activeRecipeCard_info)}
                          </ScrollView>
                          <View style={styles.RecipeCardButtonTab_Canvas}> 
                            <View style={styles.RecipeCardButtonTab}>
                              <View style={styles.RecipeCardButton_Canvas}>
                                <TouchableOpacity style={styles.RecipeCardButton} onPress={() => this.useScroller(recipe_card_obj.getProfileCardRef(), this.RecipeCard_ScrollViewRef)}>
                                  <Text style={styles.RecipeCardButtonText}>Recipe Card</Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                            <View style={styles.RecipeCardButtonTab}>
                              <View style={styles.RecipeCardButton_Canvas}>
                                <TouchableOpacity style={styles.RecipeCardButton} onPress={() => this.openModal()}>
                                  <Text style={styles.RecipeCardButtonText}>Ingredients</Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                            <View style={styles.RecipeCardButtonTab}>
                              <View style={styles.RecipeCardButton_Canvas}>
                                <TouchableOpacity style={styles.RecipeCardButton} onPress={() => this.useScroller(recipe_card_obj.getPhotoCardRef(), this.RecipeCard_ScrollViewRef)}>
                                <Text style={styles.RecipeCardButtonText}>Photo</Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                          </View>
                        <View style={styles.RecipeListCanvas}> 
                          <View style={styles.RecipeHeaderCanvas}>
                            <Text>Recipes</Text>
                          </View>
                          <View style={styles.RecipeList}>
                            {stockRecipeView}
                          </View>
                        </View>
                      </View>
                      <View style={styles.Page_ContentArea}
                      onLayout={(event => {this.SearchPage = event.nativeEvent.layout})}>
                        <View style={styles.Search_SearchBarCanvasArea}> 
                          <TextInput
                            style={styles.Search_SearchBarInput}
                            placeholder={"Search"}
                            onChangeText={(text) => this.searchFilter(text)}
                            value={this.state.searchText}
                          />
                        </View>
                        <View style={styles.Search_SearchesCanvasArea}> 
                            {this.getSearchList()}
                        </View>
                      </View>
                    </ScrollView>
                    <View style={styles.Page_FooterCanvasArea}>
                        {this.getBottomFooter()}
                    </View>
                    </View> 
                </SafeAreaView>
              {this.getIngredientsOverlay(this.state.ingredientsOverlay_visible)}
              {this.getMealDBOverlay(this.state.mealDB_overlay_visible, MealDB_Active_Recipe_Data)}
            </View>
          );
        }
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
  MainScrollView:{
    height:'100%',
    width:'100%',
    flexDirection:'row'
  },
  RecipeScrollViewCanvas:{
    height:'100%',
    width:'100%',
    backgroundColor:'purple'
  },
  RecipeScrollView:{
    backgroundColor:'grey',
    width: '100%',
    height:'50%',
  },
  HomePage:{
    height:'100%',
    width:'100%',
    backgroundColor:'#ffdcb5'
  },
  Page_ContentArea:{
    height: '100%',
    width: DimData.width
  },
  RecipeCardCanvas:{
    height: recipeCardCanvas_height,
    width: DimData.width,
    backgroundColor:'black',
    flexDirection:'row',
  },
  RecipeListCanvas:{
    height: recipeListCanvas_height,
    width: DimData.width,
    backgroundColor:'#ff953e',
  },
  RecipeList:{
    height:'100%',
    width:'100%',
    flexWrap:'wrap',
    flexDirection:'row',
    justifyContent:'center',
  },
  RecipeHeaderCanvas:{
    height:'10%',
    width:'100%',
    backgroundColor:'orange',
    alignItems:'center',
    justifyContent:'center'
  },
  RecipeButtonCanvas:{
    height: '10%',
    width: '40%',
    margin:'5%',
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent:'center'
  },
  RecipeButtonInactive:{
    height:'100%',
    width:'100%',
    alignItems:'center',
    justifyContent:'center',
    backgroundColor:'white',
    borderRadius:10,
  },
  RecipeButtonActive:{
    height:'100%',
    width:'100%',
    alignItems:'center',
    justifyContent:'center',
    backgroundColor:'orange',
    borderWidth:3,
    borderColor:'black',
  },
  Page_FooterCanvasArea:{
    height: footerCanvasArea_height,
    width: '100%',
    position:'absolute',
    bottom: 0,
  },
  Search_SearchBarCanvasArea:{
    height: Search_SearchBarCanvasArea_height,
    width:'100%',
    justifyContent:'center',
    backgroundColor:'grey',
  },
  Search_SearchesCanvasArea:{
    height: Search_SearchesCanvasArea_height,
    width:'100%',
    backgroundColor:'#ff953e',
    paddingBottom: DimData.height * 0.10
  },
  Search_SearchBarInput:{
    height:'30%',
    width:'80%',
    backgroundColor:'white',
    borderWidth:1,
    borderRadius:5,
    paddingLeft:'5%',
    marginLeft:'5%'
  },
  FooterCanvas:{
    height: footerCanvas_height,
    width: '100%',
    backgroundColor:'white',
    bottom: 0,
    flexDirection:'row',
  },
  FooterTab:{
    flex: 1,
    alignItems:'center',
    justifyContent:'center',
  },
  RecipeCardButtonTab:{
    flex:1,
    height:'100%',
    alignItems:'center',
    justifyContent:'center'
  },
  RecipeCardButton_Canvas:{
    height:'60%',
    width:'80%',
    alignItems:'center',
    justifyContent:'center'
  },
  RecipeCardButton:{
    height:'100%',
    width:'100%',
    alignItems:'center',
    justifyContent:'center',
    backgroundColor:'orange',
    borderRadius:10,
    borderWidth:3,
    borderColor:'white'
  },
  RecipeCardButtonText:{
    color:'white'
  },
  RecipeCardButtonTab_Canvas:{
    height:'10%', 
    width:'100%', 
    backgroundColor:'#ffdcb5',
    flexDirection:'row',
  },
  AppOverlayArea:{
    position: 'absolute',
    height:'100%',
    width:'100%'
  },
  AppOverlay:{
    height:'100%',
    width:'100%',
    backgroundColor: 'black',
    opacity:0.5,
  },
  ModalArea:{
    width:'100%',
    height:'100%',
    alignItems:'center',
    justifyContent:'center'
  },
  ModalCanvas:{
    width: RecipeOverlay_MainScrollView_width,
    height:'80%',
  },
  ModalPopup:{
    height:'100%', 
    width:'100%', 
    backgroundColor:'#ff953e',
  },
  ModalScrollviewPage:{
    height:'100%',
    width: RecipeOverlay_MainScrollView_width,
    backgroundColor:'#ff953e',
    alignItems:'center',
    justifyContent:'center'
  },
  ModalPopup_header:{
    height:'10%',
    width:'100%',
    backgroundColor:'white',
    flexDirection:'row'
  },
  ModalPopup_body:{
    height:'70%',
    width:'100%',
    backgroundColor:'blue',
  },
  ModalPopup_footer:{
    height:'20%',
    width:'100%',
    alignItems:'center',
    justifyContent:'center'
  },
  ModalPopup_CloseButton:{
    height:'50%',
    width:'60%',
    borderRadius:10,
    backgroundColor:'white',
    alignItems:'center',
    justifyContent:'center'
  },
  RecipeCardOverlay_Header_ButtonCanvas:{
    height:'100%',
    flex: 1,
  },
  RecipeCardOverlay_Header_Button:{
    height:'90%',
    width:'100%',
    backgroundColor:'white',
    alignItems:'center',
    justifyContent:'center',
  },
  RecipeCardOverlay_Header_Indicator:{
    height:'10%',
    width:'100%',
  },
  openMealDBModalCanvas:{
    width: mealDBOverlay_MainScrollView_width,
    height:'100%',
    backgroundColor:'#ff953e',
    borderTopRightRadius:10,
    borderTopLeftRadius:10,
    alignItems:'center'
  },
  openMealDBModalCloseButtonArea:{
    height:'10%',
    width: '10%',
    alignItems:'center',
    justifyContent:'center',
  },
  openMealDBModalCloseButton:{
    height:'100%',
    width:'100%',
    padding:'10%'
  },
  openMealDBModal_PictureCanvas:{
    height:'30%',
    width:'100%',
    alignItems:'center',
    justifyContent:'flex-start',
    marginBottom:'5%'
  },
  openMealDBModal_Picture:{
    height:'100%',
    width:'100%',
    backgroundColor:'white'
  },
  openMealDBModal_CallingCardCanvas:{
    width:'100%',
    height:'20%',
    backgroundColor:'white'
  },
  openMealDBModal_CallingCard:{
    width:DimData.width,
    height:'10%',
    alignItems:'center',
    justifyContent:'center',
    backgroundColor:'white'
  },
  openMealDBModal_ContentArea:{
    flex:1,
    width:DimData.width,
    backgroundColor:'#ffdcb5'
  }
});
