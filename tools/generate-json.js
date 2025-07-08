import fs from 'fs'
import commander from 'commander'
import DiagnosisMaster from '@/modules/Masters/DiagnosisMaster.js'
import ProcedureMaster from '@/modules/Masters/ProcedureMaster.js'

commander
  .option('--diagnosis', 'Generate from DiagnosisMaster')
  .option('--procedure', 'Generate from ProcedureMaster')
  .option('--dump', 'Generate master object tree dump insted of array of texts')
  .option('--year <year>', 'Year of master items')
  .option('-o, --output <file>', 'Output file name')
  .parse(process.argv)

const options = commander.opts()

const getMaster = async () => {
  let MasterClass
  if (options.diagnosis) {
    MasterClass = DiagnosisMaster
  } else if (options.procedure) {
    MasterClass = ProcedureMaster
  } else {
    console.error('Error: Please specify --diagnosis or --procedure')
    process.exit(1)
  }

  const master = new MasterClass()
  return master
}

const main = async () => {
  try {
    const master = await getMaster()
    const categories = master.Categories()
    if (categories.length === 0) {
      console.warn('No categories found')
    }

    let jsonOutput = ''

    if (options.dump) {
      // Dump the entire master object tree
      if (options.year) {
        // crawl the master object items and remove unsatisfied items
        for (const category in master) {
          for (const target in master[category]) {
            const itemcount = master[category][target].length
            for (let index = itemcount - 1; index >= 0; index--) {
              const item = master[category][target][index]
              if (item?.ValidFrom > options.year || item?.ValidTo < options.year) {
                master[category][target].splice(index, 1)
              }
            }
          }
        }
      }

      jsonOutput = JSON.stringify(master, null, 2)
    } else {
      // Generate an array of texts from the master items
      const items = []
      for (const category of categories) {
        items.push(...master.Items(category, undefined, options.year))
      }
      const texts = [...new Set(items.map(item => item.Text))]
      jsonOutput = JSON.stringify(texts, null, 2)
    }

    // Output the JSON
    if (jsonOutput === '') {
      console.warn('No items found for the specified year or criteria.')
    } else {
      if (options.output) {
        fs.writeFileSync(options.output, jsonOutput)
        console.log(`Successfully generated ${options.output}`)
      } else {
        console.log(jsonOutput)
      }
    }
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

main()
