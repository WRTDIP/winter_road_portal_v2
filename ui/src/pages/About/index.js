import bgImage from "../../assets/homebg_3.png";
import Bill from "../../assets/Bill.png";
import Yukari from "../../assets/Yukari.png";
import Len from "../../assets/Len.png";
import Leo from "../../assets/Leo.png";
import Haowen from "../../assets/Haowen.png";
import Larissa from "../../assets/Larissa.png";
import Amy from "../../assets/Amy.png";
import Moein from "../../assets/Moein.png";
import Vivienne from "../../assets/Vivienne.png";
import Person from "../../assets/Person.png";

import CoverBanner from "../../components/Global/CoverBanner/CoverBanner";
import Team from "../../components/Team";
function About() {
  const TeamMemberInfo = [[
    {
      id: 1,
      image: Bill,
      name: "Dr. William A. Gough",
      title: "Professor, Physical & Environmental Sciences",
      email: "william.gough@utoronto.ca"

    },
    {
        id: 2,
        image: Yukari,
        name: "Dr. Yukari Hori",
        title: "Research Associate, Physical & Environmental Sciences, Project Manager",
        email: "y.hori@utoronto.ca"

      },
      {
        id: 3,
        image: Len,
        name: "Dr. Leonard J.S. Tsuji",
        title: "Professor, Physical & Environmental Sciences",
        email: "leonard.tsuji@utoronto.ca"

      },
       {
        id: 4,
        image: Leo,
        name: "Leo HC Li",
        title: "Computer Engineering Co-op Student, Web programmar",
        email: "leeoo.li@mail.utoronto.ca"
       },
        {
        id: 5,
        image: Haowen,
        name: "Haowen Rui",
        title: "Computer Science Co-op Student, Web programmar",
        email: "anson.rui@mail.utoronto.ca"
        },
         {
        id: 6,
        image: Larissa,
        name: "Larissa Pizzolato",
        title: "PhD Student, Physical & Environmental Sciences, Research Assistant",
        email: "larissa.pizzolato@mail.utoronto.ca"
         }
       ], [
        {
          id: 1,
          image: Amy,
          name: "Dr. Amy M. Kim",
          title: "Associate Professor, Transportation Engineering",
          email: "amykim@civil.ubc.ca"
    
        },
        {
            id: 2,
            image: Person,
            name: "Dr. Thomas Stringer",
            title: "Postdoctoral Fellow, Transportation Engineering",
            email: "thomas.stringer@ubc.ca"
    
          },
          {
            id: 3,
            image: Moein,
            name: "Moein Sadeghi",
            title: "PhD Student, Transportation Engineering",
            email: "moein.sadeghi@ubc.ca"
    
          },
            {
            id: 4,
            image: Vivienne,
            name: "Vivienne Li",
            title: "MSc, Transportation Engineering",
            email: "vivienne.li@ubc.ca"
    
            }
        ]

  ];
  return (
    <div>
      <CoverBanner title="About" />
    <Team teamName={"University of Toronto Scarborough (UTSC)"} teamMemberInfo={TeamMemberInfo[0]} />
    <Team teamName={"University of British Columbia (UBC)"} teamMemberInfo={TeamMemberInfo[1]}/>
    </div>
  );
}

export default About;
