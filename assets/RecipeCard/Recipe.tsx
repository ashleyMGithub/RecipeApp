import React from 'react'

export default class Recipe{
    title: string;
    meal_type: string;
    serves: number;
    ingredients: [string, string]|string;
    prep_steps: string[];
    image_tag: string;
    difficulty: string;

    constructor(title:string, meal_type:string, serves:number,
        ingredients:[string, string]|string, prep_steps:string[], image_tag:string, difficulty:string ){
            this.title = title;
            this.meal_type = meal_type;
            this.serves = serves;
            this.ingredients = ingredients;
            this.prep_steps = prep_steps;
            this.image_tag = image_tag
            this.difficulty = difficulty
    }
}