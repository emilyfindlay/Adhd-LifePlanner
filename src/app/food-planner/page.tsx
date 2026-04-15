"use client";

import { useState } from "react";
import { format, addDays, startOfWeek } from "date-fns";
import {
  UtensilsCrossed,
  Plus,
  X,
  Sparkles,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
  BookOpen,
  Trash2,
  Clock,
} from "lucide-react";

interface Recipe {
  id: string;
  name: string;
  description: string;
  ingredients: string;
  instructions: string;
  prepTime: string;
  tags: string[];
  imageUrl?: string;
}

interface Meal {
  name: string;
  description: string;
  prepTime: string;
  isFromRecipes?: boolean;
  calories?: string;
}

interface DayPlan {
  date: string;
  dayName: string;
  energyNote: string;
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
  snacks: { name: string; description: string; prepTime: string }[];
}

interface MealPlan {
  weekOf: string;
  shoppingList: string[];
  prepTips: string[];
  days: DayPlan[];
}

const MEAL_TAGS = ["Quick", "Batch-friendly", "High-protein", "Vegetarian", "Vegan", "Gluten-free", "Snack", "Breakfast", "Lunch", "Dinner"];

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

export default function FoodPlannerPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [activeTab, setActiveTab] = useState<"plan" | "recipes">("plan");
  const [showAddRecipe, setShowAddRecipe] = useState(false);
  const [showGeneratePlan, setShowGeneratePlan] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set([0]));
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const [recipeForm, setRecipeForm] = useState<Omit<Recipe, "id">>({
    name: "",
    description: "",
    ingredients: "",
    instructions: "",
    prepTime: "",
    tags: [],
    imageUrl: "",
  });

  const [planForm, setPlanForm] = useState({
    preferences: "",
    calendarContext: "",
  });

  async function handleGeneratePlan() {
    setGenerating(true);
    setError("");

    try {
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      const res = await fetch("/api/ai/meal-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipes: recipes.map((r) => ({ name: r.name, description: r.description })),
          preferences: planForm.preferences,
          calendarContext: planForm.calendarContext,
          weekStartDate: format(weekStart, "yyyy-MM-dd"),
        }),
      });

      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setMealPlan(data.mealPlan);
      setShowGeneratePlan(false);
      setExpandedDays(new Set([0]));
    } catch {
      setError("Failed to generate meal plan. Please check your AI API key.");
    } finally {
      setGenerating(false);
    }
  }

  function saveRecipe() {
    if (!recipeForm.name) return;
    setRecipes((prev) => [...prev, { ...recipeForm, id: generateId() }]);
    setRecipeForm({ name: "", description: "", ingredients: "", instructions: "", prepTime: "", tags: [], imageUrl: "" });
    setShowAddRecipe(false);
  }

  function toggleTag(tag: string) {
    setRecipeForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
    }));
  }

  function toggleDay(idx: number) {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }

  function toggleShoppingItem(item: string) {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(item)) next.delete(item);
      else next.add(item);
      return next;
    });
  }

  const MEAL_COLORS: Record<string, { bg: string; label: string }> = {
    breakfast: { bg: "#F2E94E", label: "Breakfast" },
    lunch: { bg: "#B3D9F5", label: "Lunch" },
    dinner: { bg: "#FFB3D1", label: "Dinner" },
  };

  return (
    <div style={{ padding: "32px 36px", maxWidth: "1100px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#111111", letterSpacing: "-0.5px" }}>Food Planner</h1>
          <p style={{ color: "#888888", fontSize: "13px", marginTop: "4px" }}>Store your recipes and let AI plan your week of meals.</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          {mealPlan && (
            <button
              onClick={() => setShowShoppingList(true)}
              style={{ background: "#B8E8C8", color: "#111111", border: "none", borderRadius: "12px", padding: "10px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: 600 }}
            >
              <ShoppingCart size={15} /> Shopping List
            </button>
          )}
          <button
            onClick={() => setShowAddRecipe(true)}
            style={{ background: "#F8F6F2", color: "#111111", border: "1px solid #E8E4DE", borderRadius: "12px", padding: "10px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: 600 }}
          >
            <Plus size={15} /> Add Recipe
          </button>
          <button
            onClick={() => setShowGeneratePlan(true)}
            style={{ background: "#111111", color: "white", border: "none", borderRadius: "12px", padding: "10px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: 600 }}
          >
            <Sparkles size={15} /> {mealPlan ? "New Week Plan" : "Generate Plan"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", background: "#F0EDEA", borderRadius: "12px", padding: "4px", width: "fit-content", marginBottom: "24px" }}>
        {[
          { id: "plan", label: "Meal Plan", icon: <UtensilsCrossed size={14} /> },
          { id: "recipes", label: `My Recipes (${recipes.length})`, icon: <BookOpen size={14} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as "plan" | "recipes")}
            style={{ padding: "8px 16px", borderRadius: "9px", border: "none", background: activeTab === tab.id ? "white" : "transparent", cursor: "pointer", fontSize: "13px", fontWeight: activeTab === tab.id ? 700 : 500, color: activeTab === tab.id ? "#111111" : "#888888", display: "flex", alignItems: "center", gap: "6px", boxShadow: activeTab === tab.id ? "0 1px 4px rgba(0,0,0,0.1)" : "none", transition: "all 0.15s ease" }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "plan" && (
        <>
          {!mealPlan ? (
            <div style={{ background: "white", borderRadius: "20px", padding: "60px", textAlign: "center", border: "1px solid #E8E4DE" }}>
              <div style={{ width: "64px", height: "64px", background: "#FFD4B3", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <UtensilsCrossed size={28} color="#111111" />
              </div>
              <h3 style={{ fontWeight: 700, fontSize: "18px", color: "#111111", marginBottom: "8px" }}>No meal plan yet</h3>
              <p style={{ color: "#888888", fontSize: "13px", marginBottom: "20px", maxWidth: "380px", margin: "0 auto 20px" }}>
                Add some recipes first, then generate a week of meals. AI will use your calendar to match meal complexity to your busy days.
              </p>
              <button onClick={() => setShowGeneratePlan(true)} style={{ background: "#111111", color: "white", border: "none", borderRadius: "12px", padding: "11px 22px", cursor: "pointer", fontSize: "13px", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "8px" }}>
                <Sparkles size={16} /> Generate week plan
              </button>
            </div>
          ) : (
            <>
              <div style={{ background: "white", borderRadius: "16px", padding: "16px 20px", border: "1px solid #E8E4DE", marginBottom: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
                <div>
                  <p style={{ fontWeight: 700, fontSize: "14px", color: "#111111" }}>
                    Week of {format(new Date(mealPlan.weekOf + "T00:00:00"), "d MMMM yyyy")}
                  </p>
                  <p style={{ fontSize: "12px", color: "#888888" }}>7-day AI meal plan · {mealPlan.shoppingList.length} items to shop</p>
                </div>
                {mealPlan.prepTips.length > 0 && (
                  <div style={{ marginLeft: "auto", display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {mealPlan.prepTips.slice(0, 2).map((tip, i) => (
                      <span key={i} style={{ background: "#FFFDE7", borderRadius: "8px", padding: "4px 10px", fontSize: "11px", color: "#555555" }}>💡 {tip}</span>
                    ))}
                  </div>
                )}
              </div>

              {mealPlan.days.map((day, di) => {
                const isExpanded = expandedDays.has(di);
                return (
                  <div key={di} style={{ background: "white", borderRadius: "16px", border: "1px solid #E8E4DE", marginBottom: "10px", overflow: "hidden" }}>
                    <button
                      onClick={() => toggleDay(di)}
                      style={{ width: "100%", background: "transparent", border: "none", padding: "16px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px", textAlign: "left" }}
                    >
                      <div style={{ textAlign: "center", minWidth: "40px" }}>
                        <p style={{ fontSize: "10px", fontWeight: 700, color: "#888888", textTransform: "uppercase" }}>
                          {day.dayName.slice(0, 3)}
                        </p>
                        <p style={{ fontSize: "18px", fontWeight: 800, color: "#111111" }}>
                          {format(new Date(day.date + "T00:00:00"), "d")}
                        </p>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                          {[day.breakfast, day.lunch, day.dinner].map((meal, mi) => (
                            <span key={mi} style={{ background: ["#FEF9C3", "#DBEAFE", "#FCE7F3"][mi], borderRadius: "6px", padding: "2px 8px", fontSize: "11px", fontWeight: 600, color: "#111111" }}>
                              {meal.name}
                            </span>
                          ))}
                        </div>
                        {day.energyNote && (
                          <p style={{ fontSize: "11px", color: "#888888", marginTop: "3px" }}>{day.energyNote}</p>
                        )}
                      </div>
                      {isExpanded ? <ChevronUp size={16} color="#888888" /> : <ChevronDown size={16} color="#888888" />}
                    </button>

                    {isExpanded && (
                      <div style={{ padding: "0 20px 20px" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "10px" }}>
                          {(["breakfast", "lunch", "dinner"] as const).map((mealType) => {
                            const meal = day[mealType];
                            const mc = MEAL_COLORS[mealType];
                            return (
                              <div key={mealType} style={{ background: mc.bg + "44", borderRadius: "12px", padding: "14px" }}>
                                <p style={{ fontSize: "10px", fontWeight: 700, color: "#888888", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>{mc.label}</p>
                                <p style={{ fontWeight: 700, fontSize: "13px", color: "#111111", marginBottom: "3px" }}>{meal.name}</p>
                                <p style={{ fontSize: "11px", color: "#555555", marginBottom: "6px", lineHeight: 1.4 }}>{meal.description}</p>
                                <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                                  <span style={{ fontSize: "10px", color: "#888888", display: "flex", alignItems: "center", gap: "2px" }}>
                                    <Clock size={9} /> {meal.prepTime}
                                  </span>
                                  {meal.calories && <span style={{ fontSize: "10px", color: "#888888" }}>{meal.calories}</span>}
                                  {meal.isFromRecipes && (
                                    <span style={{ background: "#B3D9F5", borderRadius: "4px", padding: "1px 5px", fontSize: "9px", fontWeight: 700, color: "#111111" }}>Saved</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {day.snacks.length > 0 && (
                          <div style={{ background: "#F8F6F2", borderRadius: "10px", padding: "12px 14px" }}>
                            <p style={{ fontSize: "10px", fontWeight: 700, color: "#888888", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>Snacks</p>
                            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                              {day.snacks.map((snack, si) => (
                                <div key={si} style={{ background: "white", borderRadius: "8px", padding: "6px 10px", border: "1px solid #E8E4DE" }}>
                                  <p style={{ fontWeight: 600, fontSize: "12px", color: "#111111" }}>{snack.name}</p>
                                  <p style={{ fontSize: "10px", color: "#888888" }}>{snack.prepTime}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </>
      )}

      {activeTab === "recipes" && (
        <>
          {recipes.length === 0 ? (
            <div style={{ background: "white", borderRadius: "20px", padding: "60px", textAlign: "center", border: "1px solid #E8E4DE" }}>
              <div style={{ width: "64px", height: "64px", background: "#FFD4B3", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <BookOpen size={28} color="#111111" />
              </div>
              <h3 style={{ fontWeight: 700, fontSize: "18px", color: "#111111", marginBottom: "8px" }}>No recipes yet</h3>
              <p style={{ color: "#888888", fontSize: "13px", marginBottom: "20px", maxWidth: "360px", margin: "0 auto 20px" }}>
                Add your favourite recipes — AI will include them in your weekly meal plans.
              </p>
              <button onClick={() => setShowAddRecipe(true)} style={{ background: "#111111", color: "white", border: "none", borderRadius: "12px", padding: "11px 22px", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}>
                Add first recipe
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "14px" }}>
              {recipes.map((recipe) => (
                <div key={recipe.id} style={{ background: "white", borderRadius: "16px", padding: "18px", border: "1px solid #E8E4DE" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "8px" }}>
                    <p style={{ fontWeight: 700, fontSize: "14px", color: "#111111" }}>{recipe.name}</p>
                    <button onClick={() => setRecipes((prev) => prev.filter((r) => r.id !== recipe.id))} style={{ background: "transparent", border: "none", cursor: "pointer" }}>
                      <Trash2 size={14} color="#CCCCCC" />
                    </button>
                  </div>
                  <p style={{ fontSize: "12px", color: "#555555", lineHeight: 1.5, marginBottom: "10px" }}>{recipe.description}</p>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "8px" }}>
                    {recipe.tags.map((tag) => (
                      <span key={tag} style={{ background: "#F8F6F2", borderRadius: "6px", padding: "2px 8px", fontSize: "10px", fontWeight: 600, color: "#555555" }}>{tag}</span>
                    ))}
                  </div>
                  {recipe.prepTime && (
                    <span style={{ fontSize: "11px", color: "#888888", display: "flex", alignItems: "center", gap: "3px" }}>
                      <Clock size={10} /> {recipe.prepTime}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Add Recipe Modal */}
      {showAddRecipe && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "20px" }}>
          <div style={{ background: "white", borderRadius: "20px", padding: "28px", width: "100%", maxWidth: "520px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "22px" }}>
              <h3 style={{ fontWeight: 800, fontSize: "18px", color: "#111111" }}>Add Recipe</h3>
              <button onClick={() => setShowAddRecipe(false)} style={{ background: "transparent", border: "none", cursor: "pointer" }}><X size={20} color="#888888" /></button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#888888", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "5px" }}>Recipe Name *</label>
                  <input value={recipeForm.name} onChange={(e) => setRecipeForm({ ...recipeForm, name: e.target.value })} placeholder="e.g. Overnight Oats" style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid #E8E4DE", fontSize: "13px", background: "#F8F6F2" }} />
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#888888", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "5px" }}>Prep Time</label>
                  <input value={recipeForm.prepTime} onChange={(e) => setRecipeForm({ ...recipeForm, prepTime: e.target.value })} placeholder="e.g. 10 min" style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid #E8E4DE", fontSize: "13px", background: "#F8F6F2" }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#888888", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "5px" }}>Description</label>
                <textarea value={recipeForm.description} onChange={(e) => setRecipeForm({ ...recipeForm, description: e.target.value })} placeholder="Quick description of the dish..." rows={2} style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid #E8E4DE", fontSize: "13px", background: "#F8F6F2", resize: "none" }} />
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#888888", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "5px" }}>Ingredients</label>
                <textarea value={recipeForm.ingredients} onChange={(e) => setRecipeForm({ ...recipeForm, ingredients: e.target.value })} placeholder="List ingredients, one per line..." rows={3} style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid #E8E4DE", fontSize: "13px", background: "#F8F6F2", resize: "none" }} />
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#888888", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "5px" }}>Instructions (optional)</label>
                <textarea value={recipeForm.instructions} onChange={(e) => setRecipeForm({ ...recipeForm, instructions: e.target.value })} placeholder="Step by step instructions..." rows={3} style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid #E8E4DE", fontSize: "13px", background: "#F8F6F2", resize: "none" }} />
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#888888", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "8px" }}>Tags</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {MEAL_TAGS.map((tag) => (
                    <button key={tag} onClick={() => toggleTag(tag)} style={{ padding: "5px 10px", borderRadius: "8px", border: "1px solid", borderColor: recipeForm.tags.includes(tag) ? "#111111" : "#E8E4DE", background: recipeForm.tags.includes(tag) ? "#111111" : "transparent", color: recipeForm.tags.includes(tag) ? "white" : "#555555", cursor: "pointer", fontSize: "12px", fontWeight: 500, transition: "all 0.15s ease" }}>
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={saveRecipe} disabled={!recipeForm.name} style={{ padding: "12px", borderRadius: "12px", border: "none", background: recipeForm.name ? "#111111" : "#CCCCCC", color: "white", fontWeight: 700, fontSize: "14px", cursor: recipeForm.name ? "pointer" : "not-allowed" }}>
                Save Recipe
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generate Plan Modal */}
      {showGeneratePlan && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "20px" }}>
          <div style={{ background: "white", borderRadius: "20px", padding: "28px", width: "100%", maxWidth: "480px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "22px" }}>
              <div>
                <h3 style={{ fontWeight: 800, fontSize: "18px", color: "#111111" }}>Generate Meal Plan</h3>
                <p style={{ fontSize: "12px", color: "#888888", marginTop: "2px" }}>Using {recipes.length} saved recipe{recipes.length !== 1 ? "s" : ""}</p>
              </div>
              <button onClick={() => setShowGeneratePlan(false)} style={{ background: "transparent", border: "none", cursor: "pointer" }}><X size={20} color="#888888" /></button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#888888", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "5px" }}>Dietary preferences & notes</label>
                <textarea value={planForm.preferences} onChange={(e) => setPlanForm({ ...planForm, preferences: e.target.value })} placeholder="e.g. I'm vegetarian, I don't like spicy food, I need high-protein breakfasts for gym days, I want quick lunches..." rows={3} style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid #E8E4DE", fontSize: "13px", background: "#F8F6F2", resize: "none" }} />
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#888888", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "5px" }}>Weekly calendar (optional)</label>
                <textarea value={planForm.calendarContext} onChange={(e) => setPlanForm({ ...planForm, calendarContext: e.target.value })} placeholder="e.g. Mon/Wed/Fri: lectures 9am-3pm (need quick meals). Tue: gym at 6pm (need high-protein dinner). Sat: free day." rows={3} style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid #E8E4DE", fontSize: "13px", background: "#F8F6F2", resize: "none" }} />
              </div>

              {error && (
                <div style={{ background: "#FFF0F0", borderRadius: "10px", padding: "10px 14px", display: "flex", gap: "8px", alignItems: "center" }}>
                  <AlertCircle size={14} color="#CC0000" />
                  <span style={{ fontSize: "12px", color: "#CC0000" }}>{error}</span>
                </div>
              )}

              <button onClick={handleGeneratePlan} disabled={generating} style={{ padding: "12px", borderRadius: "12px", border: "none", background: generating ? "#888888" : "#111111", color: "white", fontWeight: 700, fontSize: "14px", cursor: generating ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                {generating ? (
                  <><div style={{ width: "14px", height: "14px", border: "2px solid transparent", borderTop: "2px solid white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />Planning your week...</>
                ) : (
                  <><Sparkles size={16} /> Generate 7-Day Plan</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shopping List Modal */}
      {showShoppingList && mealPlan && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "20px" }}>
          <div style={{ background: "white", borderRadius: "20px", padding: "28px", width: "100%", maxWidth: "400px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", maxHeight: "85vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexShrink: 0 }}>
              <div>
                <h3 style={{ fontWeight: 800, fontSize: "18px", color: "#111111" }}>Shopping List</h3>
                <p style={{ fontSize: "12px", color: "#888888" }}>{checkedItems.size}/{mealPlan.shoppingList.length} items checked</p>
              </div>
              <button onClick={() => setShowShoppingList(false)} style={{ background: "transparent", border: "none", cursor: "pointer" }}><X size={20} color="#888888" /></button>
            </div>
            <div style={{ overflowY: "auto", flex: 1 }}>
              {mealPlan.shoppingList.map((item) => {
                const isChecked = checkedItems.has(item);
                return (
                  <label key={item} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 0", borderBottom: "1px solid #F8F6F2", cursor: "pointer" }}>
                    <input type="checkbox" checked={isChecked} onChange={() => toggleShoppingItem(item)} style={{ width: "16px", height: "16px", cursor: "pointer" }} />
                    <span style={{ fontSize: "13px", color: isChecked ? "#AAAAAA" : "#111111", textDecoration: isChecked ? "line-through" : "none" }}>{item}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
