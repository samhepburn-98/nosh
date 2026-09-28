# Notes for the Product Owner

Questions and findings to raise with Nosh's Product Owner at the end of the project. They're mostly about the client's data and brand pack, where the answer is theirs to give, not ours to guess.

**How we use this file**
- Add a note as soon as we find something, in the PR where we found it.
- Each note says what we found, what the app does in the meantime, and what we'd like to ask.
- Tick a note once it's been raised, and write the answer under it.

---

## 1. Dietary tags look incomplete or wrong
- [ ] Raised

- Tomato Soup is vegan but not tagged dairy-free. Our vegan rule covers it.
- Fish and Chips and the Full English are dairy-free in practice but untagged.
- **Shepherd's Pie is tagged gluten-free, but beef stock cubes usually contain wheat.**

**Meanwhile:** filtering goes by the tags as supplied, never guessed from ingredients, and Preferences has an allergy note.

**Ask:** can the tags be checked? We recommend an allergen or "may contain" field.

## 2. Content gaps
- [ ] Raised

Vegans have 2 recipes and no breakfast. Gluten-free and dairy-free users have no breakfast.

**Meanwhile:** recipes that don't fit are listed after the ones that do, never hidden, so no one sees an empty list.

**Ask:** are more recipes planned for these groups?

## 3. The same ingredient in different units
- [ ] Raised

Chicken breast (g and a count), coconut milk (tin and ml), salad leaves (handful and g), milk (ml and tbsp).

**Meanwhile:** units of different kinds are never converted into each other, so the shopping list shows "chicken breast 600 g + 2".

**Ask:** can units be standardised at the source?

## 4. Ingredients only in the method
- [ ] Raised

"A little oil", "500ml water" and "seasoned flour" appear in methods but not in ingredient lists.

**Meanwhile:** the shopping list and "Cook from what you have" only count listed ingredients.

**Ask:** should these be added to the ingredient lists?

## 5. Near-duplicate ingredients
- [ ] Raised

Porridge oats / rolled oats, oil / olive oil / sesame oil, potatoes / baking potatoes.

**Meanwhile:** only names with the same singular form merge ("carrot" and "carrots"), so these stay separate lines.

**Ask:** which are interchangeable when shopping?

## 6. Servings range from 1 to 6
- [ ] Raised

**Meanwhile:** the shopping list buys each recipe as written.

**Ask:** should it scale to household size?

## 7. No prices, pack sizes, nutrition or cook times
- [ ] Raised

The brief mentions "nutritional recipes". "Quick" has no definition.

**Meanwhile:** "Quick" is shown as written, without promising a time.

**Ask:** is any of this data available?

## 8. Logo
- [ ] Raised

The brand pack supplies the mark and the wordmark as separate images, and only shows them stacked, the mark above the wordmark. A stacked logo is too tall for a phone's top bar, so we've put them side by side.

- **Is there a horizontal (side-by-side) version of the logo** we should use instead? If not, is our arrangement acceptable: the mark to the left of the wordmark, 6px apart, both unaltered?
- May the mark be used alone? We use it as the favicon.
- The "Meal planning platform" line can't be read at top-bar size. Is there a wordmark without it?
- Clear space limits the logo to 30px tall in the top bar. Would they accept less clear space there?

**Meanwhile:** the mark and the wordmark sit side by side, 6px apart, unaltered, 30px tall, with the "O"-width clear space around the whole logo.
