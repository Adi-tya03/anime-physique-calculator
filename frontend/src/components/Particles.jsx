import Particles from "react-tsparticles";

export default function BackgroundParticles() {

  return (

    <div className="absolute inset-0 -z-10">

      <Particles

        options={{

          fullScreen: false,

          particles: {

            number: {

              value: 40,

            },

            color: {

              value: ["#8B5CF6", "#06B6D4"]

            },

            move: {

              enable: true,

              speed: 1,

            },

            opacity: {

              value: 0.3

            },

            size: {

              value: {

                min: 1,

                max: 4

              }

            }

          }

        }}

      />

    </div>

  )

}