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
        image: Person,
        name: "Mohammad Rahman",
        title: "Computer Science Co-op Student, Web programmar",
        email: "mohammadk.rahman@mail.utoronto.ca"
       },
      {
        id: 5,
        image: Person,
        name: "Brett Yang",
        title: "Computer Engineering Co-op Student, Web programmar",
        email: "bretteng.yang@mail.utoronto.ca"
       },
       {
        id: 6,
        image: Leo,
        name: "Leo HC Li",
        title: "Computer Engineering Co-op Student, Web programmar",
        email: "leeoo.li@mail.utoronto.ca"
       },
        {
        id: 7,
        image: Haowen,
        name: "Haowen Rui",
        title: "Computer Science Co-op Student, Web programmar",
        email: "anson.rui@mail.utoronto.ca"
        },
         {
        id: 8,
        image: Larissa,
        name: "Larissa Pizzolato",
        title: "PhD Student, Physical & Environmental Sciences, Research Assistant",
        email: "larissa.pizzolato@mail.utoronto.ca"
         },
                
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
          name: "Dr. Ramesh Pokharel",
          title: "Postdoctoral Fellow, Transportation Engineering",
          email: "ramesh.pokharel@ubc.ca"
        },
        {
            id: 3,
            image: Person,
            name: "Dr. Thomas Stringer",
            title: "Postdoctoral Fellow, Transportation Engineering",
            email: "thomas.stringer@ubc.ca"
    
          },
          {
            id: 4,
            image: Moein,
            name: "Moein Sadeghi",
            title: "PhD Student, Transportation Engineering",
            email: "moein.sadeghi@ubc.ca"
    
          },
            {
            id: 5,
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
      <Team teamName={
        <>
          Climate Lab at UTSC (CL@UT)
          <br />
          University of Toronto Scarborough (UTSC)
        </>
       } 
         description={
          <div style={{ textAlign: "left", margin: "1rem 0", color: "#0E2959", fontSize: "1rem" }}>
            The Climate Lab at the University of Toronto (CL@UT), led by Professor William A. Gough at the University of Toronto Scarborough (UTSC), 
            focuses on research related to climate change impacts, vulnerability, and adaptation. The lab investigates a wide range of topics, including
            climate change in the eastern Arctic, northern Canada, and Canadian cities; climate impact assessments; numerical ocean and climate modeling; 
            air quality in southwestern Ontario; hurricanes and their relationship to climate change; day-to-day temperature variability; climate change policy; 
            and broader issues in climatology, meteorology, and physical geography. Dr. Bill Gough and Dr. Yukari Hori have led several research projects at CL@UT 
            examining the effects of climate change on winter road networks in Northern Canada.
          </div>
       }
       teamMemberInfo={TeamMemberInfo[0]} />      

      <Team teamName={
        <>
          Multimodal Mobility Systems Lab
          <br />
          University of British Columbia (UBC)
        </>
        } 
        description={
          <div style={{ textAlign: "left", margin: "1rem 0", color: "#0E2959", fontSize: "1rem" }}>
            The Multimodal Mobility Systems Lab at UBC, led by Dr. Amy M. Kim, focuses on research in transportation engineering, mobility systems, and sustainable infrastructure. 
            The lab seeks to understand how long-distance transportation systems and their components operate, particularly under disruptions, and how to plan responsive, resilient systems for acute natural hazards and climate change adaptation. 
            They also want to learn how these impacts and disruptions affect peoples' connectivity across long-distances, and how impacts may be unequal across the system.
          </div>
        }
        teamMemberInfo={TeamMemberInfo[1]}/>
    </div>
  );
}

export default About;
