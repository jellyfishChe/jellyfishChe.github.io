given a 2-dimension space (1000*500 default) and 100 people, each person is (1*1)

simulate the moving in the space

the rule is that
  - there exists the hitbox between the two people
  - the people could not cross the border
  - the next moving is based on the current moving vector plus one random unit vector, then normalize it to unit vector
  - if the next position would cross the border, set the moving vector be the negative one